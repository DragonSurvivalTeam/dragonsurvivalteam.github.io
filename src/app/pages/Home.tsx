import { useMemo } from 'preact/hooks'
import { ChangelogEntry, Footer, GeneratorCard, ToolCard, ToolGroup } from '../components/index.js'
import { useLocale, useTitle } from '../contexts/index.js'
import { useAsync } from '../hooks/useAsync.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { fetchChangelogs, fetchVersions } from '../services/DataFetcher.js'
import { Store } from '../Store.js'

const MIN_FAVORITES = 2
const MAX_FAVORITES = 5

interface Props {
	path?: string,
}
export function Home({}: Props) {
	const { locale } = useLocale()
	useTitle(locale('title.home'))

	const smallScreen = useMediaQuery('(max-width: 580px)')

	return <main>
		<div class="legacy-container">
			<div class="card-group">
				{smallScreen ? /* mobile */ <>
					<PopularGenerators />
					<FavoriteGenerators />
					<Changelog />
					<Versions />
					<Tools />
				</> : /* desktop */ <>
					<div class="card-column">
						<PopularGenerators />
						<Changelog />
						<Versions />
					</div>
					{!smallScreen && <div class="card-column">
						<FavoriteGenerators />
						<Tools />
					</div>}
				</>}
			</div>
			<Footer />
		</div>
	</main>
}

function PopularGenerators() {
	const { locale } = useLocale()
	return <ToolGroup title={locale('generators.popular')} link="/generators/">
		<GeneratorCard minimal id="loot_table" />
		<GeneratorCard minimal id="advancement" />
		<GeneratorCard minimal id="recipe" />
		<ToolCard title={locale('worldgen')} link="/worldgen/" titleIcon="worldgen" />
		<ToolCard title={locale('generators.all')} link="/generators/" titleIcon="arrow_right" />
		<ToolCard title={locale('generators.partners')} link="/partners/" titleIcon="arrow_right" />
	</ToolGroup>
}

function FavoriteGenerators() {
	const { locale } = useLocale()

	const favorites = useMemo(() => {
		const history: string[] = []
		for (const id of Store.getGeneratorHistory().reverse()) {
			if (!history.includes(id)) {
				history.push(id)
			}
		}
		return history.slice(0, MAX_FAVORITES)
	}, [])

	if (favorites.length < MIN_FAVORITES) return <></>

	return <ToolGroup title={locale('generators.recent')}>
		{favorites.map(f => <GeneratorCard minimal id={f} />)}
	</ToolGroup>
}

function Tools() {
	const { locale } = useLocale()

	return <ToolGroup title={locale('tools')}>
		<ToolCard title="Converter" icon="convert"
			link="/convert/"
			desc="Turn /give commands into loot tables" />
		<ToolCard title="Customized Worlds" icon="customized"
			link="/customized/"
			desc="Create data packs to customize your world" />
		<ToolCard title="Report Inspector" icon="report"
			link="https://misode.github.io/report/"
			desc="Analyse your performance reports" />
		<ToolCard title="Minecraft Sounds" icon="sounds"
			link="/sounds/"
			desc="Browse through and mix all the vanilla sounds" />
		<ToolCard title="Transformation preview"
			link="/transformation/"
			desc="Visualize transformations for display entities" />
		<ToolCard title="Template Placer"
			link="https://misode.github.io/template-placer/"
			desc="Automatically place all the structure pieces in your world" />
	</ToolGroup>
}

function Versions() {
	const { locale } = useLocale()

	const { value: versions } = useAsync(fetchVersions, [])
	const release = useMemo(() => versions?.find(v => v.type === 'release'), [versions])

	return <ToolGroup title={locale('versions.minecraft_versions')} link="/versions/" titleIcon="arrow_right">
		{(versions?.[0] && release) && <>
			{versions[0].id !== release.id && (
				<ToolCard title={versions[0].name} link={`/versions/?id=${versions[0].id}`} desc={locale('versions.latest_snapshot')} />
			)}
			<ToolCard title={release.name} link={`/versions/?id=${release.id}`} desc={locale('versions.latest_release')} />
		</>}
	</ToolGroup>
}

function Changelog() {
	const { locale } = useLocale()

	const hugeScreen = useMediaQuery('(min-width: 960px)')

	const { value: changes } = useAsync(fetchChangelogs, [])
	const latestChanges = useMemo(() => {
		return changes
			?.sort((a, b) => b.order - a.order)
			.filter(c => !(c.tags.includes('pack') && c.tags.includes('breaking')))
			.slice(0, 2)
	}, [changes])

	return <ToolGroup title={locale('changelog')} link="/changelog/" titleIcon="git_commit">
		{latestChanges?.map(change => <ChangelogEntry minimal={!hugeScreen} short={true} change={change} />)}
	</ToolGroup>
}
