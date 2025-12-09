import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { colord } from 'colord'
import { apiSportTeamType } from '../../infrastructure/sib-api/apiSportTeamType.js'
import { logger } from '../../logger.js'

/**
 * Create team presets with header and two buttons (home/guest) per team, under "Teams" category.
 * @param {ApiSportTeamWithoutPlayers[]} teams
 * @returns {object} presets dictionary
 */
export function createPresetsFromTeamsArray(teams) {
  logger.debug('[createPresetsFromTeamsArray] Start creating team presets')
  if (!Array.isArray(teams) || !teams) {
    return {}
  }
  const presets = {}
  const CATEGORY = 'Teams'

  for (const team of teams) {
    // Header
    const headerId = `header_team_${team.Id}`
    presets[headerId] = {
      type: 'text',
      category: CATEGORY,
      name: team.Name,
      text: 'Move this button to the canvas to activate',
    }

    // Helper for button creation
    function makeTeamButton(teamType) {
      let bgClrInt = -1
      let clr

      if (team.TeamColorHex !== '') {
        clr = colord(team.TeamColorHex).toRgb()
        bgClrInt = combineRgb(clr.r, clr.g, clr.b)
      } else {
        bgClrInt = combineRgb(0, 0, 0)
      }

      let buttonLabel, buttonName
      if (teamType === apiSportTeamType.Home) {
        buttonLabel = 'Change to Home Team'
        buttonName = `Change home team to ${team.Name}`
      } else {
        buttonLabel = 'Change to Guest Team'
        buttonName = `Change guest team to ${team.Name}`
      }

      // Style
      const style = {
        text: team.Name,
        size: 'auto',
        color: combineRgb(255, 255, 255),
        bgcolor: bgClrInt,
        pngalignment: 'center:center',
      }

      // Logo logic
      if (team.LogoSmallBase64 !== '') {
        style.color = combineRgb(255, 255, 255)
        style.bgcolor = combineRgb(0, 0, 0)
        style.png64 = team.LogoSmallBase64
      } else {
        if (colord(team.TeamColorHex).isDark()) {
          style.color = combineRgb(255, 255, 255)
        } else {
          style.color = combineRgb(0, 0, 0)
        }
        style.bgcolor = bgClrInt
      }

      return {
        type: 'button',
        category: CATEGORY,
        name: buttonName,
        style,
        steps: [
          {
            down: [
              {
                actionId: actionId.ChangeTeam,
                options: {
                  team_type: teamType,
                  team_oid: team.Id,
                },
              },
            ],
            up: [],
          },
        ],
        feedbacks: [],
      }
    }

    // Home team button
    const homeButtonId = `team_${team.Id}_home`
    presets[homeButtonId] = makeTeamButton(apiSportTeamType.Home)

    // Guest team button
    const guestButtonId = `team_${team.Id}_guest`
    presets[guestButtonId] = makeTeamButton(apiSportTeamType.Guest)
  }

  logger.debug('[createPresetsFromTeamsArray] Finished creating team presets')
  return presets
}
