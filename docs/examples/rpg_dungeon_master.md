# AI RPG Dungeon Master Engine

## Project idea

Build a multi-agent text RPG orchestrator that runs as a dungeon master: narrate scenes, play NPCs, track world state, resolve rules and combat, and generate balanced encounters. The experience should stay immersive and mechanically consistent—player choices matter, but dice/rules and story voice stay cleanly separated so the fiction does not invent illegal outcomes.

The deliverable is the **prompt architecture** for this engine (roles, handoffs, state schema), not a full game client or 3D world.

## Goals

- Support continuous play: explore, talk, inventory, quests, combat, rest.
- Keep world state consistent (location, inventory, factions, quest flags, HP).
- Separate narration/NPC dialogue from mechanical resolution (checks, damage, DC).
- Dynamically generate encounters and loot appropriate to level and location.
- Allow themed tone packs (e.g. dark fantasy, cyberpunk) without changing core rules agents.
- Recover gracefully from impossible or contradictory player actions.

## Non-goals

- Graphical map, sprites, or real-time multiplayer.
- Full tabletop rulebook parity with every edge case of D&D 5e (a simplified consistent ruleset is fine).
- User-generated campaign marketplace (v1).
- Voice or image generation pipelines (text only).

## Users / personas

- **Solo player**: wants a responsive DM without a human host.
- **Rules-curious player**: cares that stealth, combat, and inventory checks feel fair.

## Core capabilities

- Scene narration and NPC dialogue in a fixed tone.
- Authoritative world state updates after each resolved action.
- Ability checks, combat rounds, inventory gates (keys, tools), and rest/heal rules.
- Encounter design: enemies, traps, loot tables scaled to player level and zone.
- Quest tracking: active, completed, failed; blockers when prerequisites missing.
- Optional session save/load of world state snapshot.

## Multi-agent shape (suggested)

### Dungeon Master (narrator and dialoguer)

- Narrates transitions, describes environment, speaks as NPCs.
- Boundary: thematic tone only; must **not** roll dice or decide damage itself.

### Lore and State Keeper

- System-of-record for locations, inventory, factions, quests, flags, HP.
- Inputs: resolved events and player choices after rules arbitration.

### Rules and Combat Arbitrator

- Translates intended actions into mechanics (checks, damage, DC, inventory requirements).
- Inputs: player stats, item bonuses, current encounter state.

### Encounter Designer

- Builds balanced fights, traps, and loot for level + location + active quests.
- Inputs: world level, player health, zone tags, quest context.

## State and data

Canonical state should include at least:

- Player: name, level, stats, HP/resources, inventory, known abilities.
- World: current location, explored graph, faction standings, global flags.
- Quest log: id, status, objectives, blockers.
- Combat: in_combat flag, turn order, enemy stat blocks, conditions.
- Tone pack id (theme).
- Session seed / RNG stream id if deterministic replay is desired.

Rules arbitrator proposes deltas; State Keeper applies validated updates only.

## Interfaces

- **Human I/O**: free-text player actions and dialogue.
- **Session start**: theme, character sheet (or generate default), starting location.
- **Outputs**: narrative turns + optional structured state dump for debugging/save.

## Quality and safety constraints

- Narrator never invents inventory items or quest completion without State Keeper confirmation.
- Combat outcomes must come from Rules arbitrator, then be narrated.
- Refuse or redirect harmful real-world content; keep fiction in-game.
- On contradiction (e.g. use item not owned), State Keeper rejects; DM explains in-world.
- Prefer short turns; do not dump multi-room lore unprompted.

## Acceptance checks

- [ ] Narrator and rules roles cannot be collapsed into one prompt without losing the boundary.
- [ ] Using an item not in inventory is rejected and explained in character.
- [ ] Combat damage and checks are produced by the rules agent before narration of results.
- [ ] Encounter difficulty scales with player level in a documented way.
- [ ] World state after five mixed actions remains consistent (location, HP, inventory).
- [ ] Theme pack changes prose tone without changing mechanical resolution schema.
- [ ] Save/load (or full state export) round-trips the fields listed under State and data.
