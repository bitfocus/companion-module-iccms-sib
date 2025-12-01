import { createPresetsFromTeamsArray } from '../../../application/presetFactory/createPresetsFromTeamsArray.js'

describe('createPresetsFromTeamsArray', () => {
  test('creates correct presets for teams array', () => {
    // arrange
    const team1 = {
      Id: 4,
      Name: 'Team Arlen',
      ShortName: 'T-Arl',
      LogoBase64: 'logo_64',
      LogoSmallBase64: 'logo_small_64',
      TeamColorHex: '#F2EA35FF',
    }
    const team2 = {
      Id: 5,
      Name: 'Team Five',
      ShortName: 'T-Five',
      LogoBase64: 'logo_64',
      LogoSmallBase64: 'logo_small_64',
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
})
