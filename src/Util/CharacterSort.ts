import CharacterSheet from "../Data/Characters/CharacterSheet";
import { ArtCharDatabase } from "../Database/Database";
import i18n from "../i18n";
import { CharacterKey } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const characterSortKeys = ["level", "rarity", "name"]
export type CharacterSortKey = typeof characterSortKeys[number]

export function characterSortConfigs(database: ArtCharDatabase, characterSheets: Record<CharacterKey, CharacterSheet>): SortConfigs<CharacterSortKey, CharacterKey> {
  return {
    new: {
      getValue: (ck) => database._getChar(ck as CharacterKey) ? 0 : 1,
      tieBreaker: "name"
    },
    name: {
      // TODO: #412 - Enforce that the character names are loaded: getValue: (ck) => i18n.t(`char_${ck}_gen:name`).toString(),
      getValue: (ck) => ck
    },
    level: {
      getValue: (ck) => {
        const char = database._getChar(ck as CharacterKey)
        if (!char) return 0
        return char.level * char.ascension
      },
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: (ck) => characterSheets?.[ck]?.rarity,
      tieBreaker: "level"
    }
  }
}

export type CharacterFilterConfigs = FilterConfigs<"element" | "weaponType" | "favorite" | "name", CharacterKey>
export function characterFilterConfigs(database: ArtCharDatabase, characterSheets: Record<CharacterKey, CharacterSheet>): CharacterFilterConfigs {
  return {
    element: (ck, filter) => filter.includes(characterSheets?.[ck]?.elementKey) ||
      (ck === "Traveler" && !database._getChar(ck as CharacterKey) && filter.some(fe => characterSheets.Traveler.elementKeys.includes(fe))) ||
      (ck === "Traveler" && filter.includes(database._getChar(ck as CharacterKey)?.elementKey)),
    weaponType: (ck, filter) => filter.includes(characterSheets?.[ck]?.weaponTypeKey),
    favorite: (ck, filter) =>
      !filter || (filter === (database._getChar(ck as CharacterKey)?.favorite ? "yes" : "no")),
    name: (ck, filter) => !filter || (i18n.t(`char_${ck}_gen:name`).toLowerCase().includes(filter.toLowerCase()))
  }
}
