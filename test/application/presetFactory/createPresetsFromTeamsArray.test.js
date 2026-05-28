import { createPresetsFromTeamsArray } from '../../../application/presetFactory/createPresetsFromTeamsArray.js'

describe('createPresetsFromTeamsArray', () => {
  test('creates correct presets for teams array', () => {
    // arrange
    const team1 = {
      Id: 4,
      Name: 'Team Arlen',
      ShortName: 'T-Arl',
      TeamColorHex: '#F2EA35FF',
    }
    const team2 = {
      Id: 5,
      Name: 'Team Five',
      ShortName: 'T-Five',
      TeamColorHex: '#F2EA35FF',
    }
    const teams = [team1, team2]

    // act
    const actual = createPresetsFromTeamsArray(teams)

    // assert
    // Should have 2 headers and 2x2 buttons = 4 presets per 2 teams
    const expectedKeys = [
      'header_team_4',
      'team_4_home',
      'team_4_guest',
      'header_team_5',
      'team_5_home',
      'team_5_guest',
    ]
    // The function creates 3 presets per team (header, home, guest)
    expect(Object.keys(actual).sort()).toEqual(expectedKeys.sort())

    // Check header structure
    expect(actual['header_team_4']).toMatchObject({
      type: 'text',
      category: 'Teams',
      name: 'Team Arlen',
      text: expect.any(String),
    })
    expect(actual['header_team_5']).toMatchObject({
      type: 'text',
      category: 'Teams',
      name: 'Team Five',
      text: expect.any(String),
    })

    // Check home button structure
    expect(actual['team_4_home']).toMatchObject({
      type: 'button',
      category: 'Teams',
      name: expect.stringContaining('home team'),
      style: expect.any(Object),
      steps: expect.any(Array),
      feedbacks: expect.any(Array),
    })
    expect(actual['team_5_home']).toMatchObject({
      type: 'button',
      category: 'Teams',
      name: expect.stringContaining('home team'),
      style: expect.any(Object),
      steps: expect.any(Array),
      feedbacks: expect.any(Array),
    })

    // Check guest button structure
    expect(actual['team_4_guest']).toMatchObject({
      type: 'button',
      category: 'Teams',
      name: expect.stringContaining('guest team'),
      style: expect.any(Object),
      steps: expect.any(Array),
      feedbacks: expect.any(Array),
    })
    expect(actual['team_5_guest']).toMatchObject({
      type: 'button',
      category: 'Teams',
      name: expect.stringContaining('guest team'),
      style: expect.any(Object),
      steps: expect.any(Array),
      feedbacks: expect.any(Array),
    })
  })

  test('returns empty object for empty array', () => {
    // arrange
    const teams = []

    // act
    const actual = createPresetsFromTeamsArray(teams)

    // assert
    expect(actual).toEqual({})
  })

  test('returns empty object for undefined', () => {
    // act
    const actual = createPresetsFromTeamsArray(undefined)

    // assert
    expect(actual).toEqual({})
  })

  test('looks up logo from teamLogos cache and sets png64 on team buttons', () => {
    // arrange
    const team = {
      Id: 7,
      Name: 'Team Seven',
      ShortName: 'T-Sev',
      TeamColorHex: '#112233',
    }
    const teamLogos = {
      getTeamLogoPngBase64: jest.fn((id) => (id === 7 ? 'png-bytes-7' : '')),
    }

    // act
    const actual = createPresetsFromTeamsArray([team], teamLogos)

    // assert
    expect(teamLogos.getTeamLogoPngBase64).toHaveBeenCalledWith(7)
    expect(actual['team_7_home'].style.png64).toBeDefined()
    expect(actual['team_7_guest'].style.png64).toBeDefined()
  })

  test('falls back to color when teamLogos returns empty string', () => {
    // arrange
    const team = {
      Id: 8,
      Name: 'Team Eight',
      ShortName: 'T-Eig',
      TeamColorHex: '#445566',
    }
    const teamLogos = {
      getTeamLogoPngBase64: jest.fn(() => ''),
    }

    // act
    const actual = createPresetsFromTeamsArray([team], teamLogos)

    // assert
    expect(actual['team_8_home'].style.png64).toBeUndefined()
    expect(actual['team_8_guest'].style.png64).toBeUndefined()
  })
})
