export const API_NAMESPACE = {
  PORTFOLIO: 'portfolio',
  GAME_GUIDES: 'game-guides',
} as const

export const ROUTES_CONSTANTS = {
  DASHBOARD: {
    ROOT: '/',
    PORTFOLIO: {
      ROOT: 'portfolio',
      URLGRP: 'portfolio/url-grp',
      URL: 'portfolio/url',
      LANGUAGE: 'portfolio/language',
      TECHNOLOGY: 'portfolio/technology',
      PROJECT: {
        ROOT: 'portfolio/project',
        FORM: 'portfolio/project/form',
      },
    },
    GAME_GUIDE: {
      ROOT: 'game-guides',
      GENRE: 'game-guides/genre',
      PLATFORM: 'game-guides/platform',
      GAME: {
        ROOT: 'game-guides/game',
        FORM: 'game-guides/game/form',
      },
    },
  },
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
}
