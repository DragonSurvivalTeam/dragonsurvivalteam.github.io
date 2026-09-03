import { getCurrentUrl, route } from 'preact-router'
import { useMemo } from 'preact/hooks'
import { SchemaGenerator } from '../components/generator/SchemaGenerator.jsx'
import { ErrorPanel, Octicon } from '../components/index.js'
import config from '../Config.js'
import { useLocale, useTitle, useVersion } from '../contexts/index.js'
import type { VersionId } from '../services/index.js'
import { generatorSupportsVersion, getGenerator } from '../Utils.js'

export const SHARE_KEY = 'share'

interface Props {
	default?: true,
}
export function Generator({}: Props) {
	const { locale } = useLocale()
	const { version, changeVersion } = useVersion()

	const gen = getGenerator(getCurrentUrl())
	if (!gen) {
		return <main><ErrorPanel error={locale('generator.not_found', getCurrentUrl())} reportable={false} /></main>
	}

	const allowedVersions = useMemo(() => {
		return config.versions
			.filter(v => generatorSupportsVersion(gen, v.id as VersionId))
			.map(v => v.id as VersionId)
			.reverse()
	}, [gen])

	useTitle(locale('title.generator', locale(`generator.${gen.id}`)), allowedVersions)

	if (!generatorSupportsVersion(gen, version)) {
		const currentIndex = config.versions.findIndex(v => v.id === version)
		const proposedVersion = allowedVersions.reduce((nearest, candidate) => {
			const candidateIndex = config.versions.findIndex(v => v.id === candidate)
			const nearestIndex = config.versions.findIndex(v => v.id === nearest)
			return Math.abs(candidateIndex - currentIndex) < Math.abs(nearestIndex - currentIndex) ? candidate : nearest
		}, allowedVersions[0])
		const lower = config.versions.findIndex(v => v.id === proposedVersion) > currentIndex
		return <main>
			<ErrorPanel error={locale(`generator.error_${lower ? 'min' : 'max'}_version`, proposedVersion)} reportable={false}>
				<div class="error-actions">
					<div class="error-action" onClick={() => changeVersion(proposedVersion)}>
						{locale('generator.switch_version', proposedVersion)} {Octicon.arrow_right}
					</div>
					<div class="error-action" onClick={() => route('/generators')}>
						{locale('generator.browse_available', version)} {Octicon.arrow_right}
					</div>
				</div>
			</ErrorPanel>
		</main>
	}
	return <SchemaGenerator gen={gen} allowedVersions={allowedVersions} />
}
