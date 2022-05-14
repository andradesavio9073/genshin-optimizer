import { ICachedArtifact, MainStatKey, StatKey, SubstatKey } from "./artifact"
import { ArtifactSetKey, SlotKey } from "./consts"

export type ArtifactsBySlot = Dict<SlotKey, ICachedArtifact[]>
export type SetFilter = { key: ArtifactSetKey | "", num: number }[]
export type ArtifactsBySlot = Dict<SlotKey, ICachedArtifact[]>
