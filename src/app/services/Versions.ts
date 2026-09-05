export const VersionIds = ['1.20', '1.21', '26.1'] as const
export type VersionId = typeof VersionIds[number]

export const DEFAULT_VERSION: VersionId = '1.21'

// Keep compatibility comparisons accurate for generator features whose boundaries
// fall between the Dragon Survival versions exposed by this site.
const VERSION_ORDER = ['1.15', '1.16', '1.17', '1.18', '1.18.2', '1.19', '1.19.3', '1.19.4', '1.20', '1.20.2', '1.20.3', '1.20.5', '1.21', '1.21.2', '1.21.4', '1.21.5', '1.21.6', '1.21.9', '1.21.11', '26.1', '26.2', '26.3'] as const
export type KnownVersionId = typeof VERSION_ORDER[number]

export function checkVersion(versionId: string, minVersionId: string | undefined, maxVersionId?: string) {
	const version = VERSION_ORDER.indexOf(versionId as KnownVersionId)
	const minVersion = minVersionId ? VERSION_ORDER.indexOf(minVersionId as KnownVersionId) : 0
	const maxVersion = maxVersionId ? VERSION_ORDER.indexOf(maxVersionId as KnownVersionId) : VERSION_ORDER.length - 1
	return minVersion <= version && version <= maxVersion
}
