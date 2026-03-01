// Centralized icon mapping — semantic name → MaterialCommunityIcons glyph
// Change a glyph here and every screen picks it up.

export const AppIcons = {
  // ─── Tab bar ───────────────────────────────────────────
  home:            'home',
  homeOutline:     'home-outline',
  programs:        'clipboard-text',
  programsOutline: 'clipboard-text-outline',
  history:         'history',
  progress:        'chart-line',
  progressOutline: 'chart-line-variant',
  profile:         'account',
  profileOutline:  'account-outline',

  // ─── Workout actions ───────────────────────────────────
  workout:     'dumbbell',
  rest:        'power-sleep',
  recovery:    'yoga',
  cardio:      'run-fast',
  startWorkout:'play-circle',
  resume:      'play-circle-outline',
  pause:       'pause-circle',
  discard:     'delete-outline',
  stop:        'stop-circle',
  finish:      'check-circle',

  // ─── Exercise / set actions ────────────────────────────
  addExercise: 'plus-circle-outline',
  addSet:      'plus',
  removeSet:   'minus',
  deleteExercise: 'trash-can-outline',
  reorder:     'drag-horizontal-variant',
  swapExercise:'swap-horizontal',
  superSet:    'link-variant',
  warmup:      'fire',
  failure:     'alert-circle-outline',
  timer:       'timer-outline',
  timerSand:   'timer-sand',

  // ─── Navigation & UI chrome ────────────────────────────
  menu:        'menu',
  back:        'arrow-left',
  close:       'close',
  chevronLeft: 'chevron-left',
  chevronRight:'chevron-right',
  chevronDown: 'chevron-down',
  chevronUp:   'chevron-up',
  search:      'magnify',
  filter:      'filter-variant',
  sort:        'sort',
  more:        'dots-vertical',
  edit:        'pencil-outline',
  delete:      'trash-can-outline',
  save:        'content-save',
  refresh:     'refresh',
  share:       'share-variant',

  // ─── Status / indicators ──────────────────────────────
  check:       'check',
  checkCircle: 'check-circle',
  alert:       'alert',
  info:        'information-outline',
  pr:          'trophy',
  deload:      'leaf',
  calendar:    'calendar',
  calendarList:'calendar-text',
  listView:    'format-list-bulleted',

  // ─── Settings / profile ────────────────────────────────
  settings:    'cog-outline',
  theme:       'brightness-6',
  sound:       'volume-high',
  soundOff:    'volume-off',
  units:       'ruler',
  weight:      'scale-bathroom',
  height:      'human-male-height',
  nutrition:   'food-apple',
  water:       'cup-water',
  sleep:       'weather-night',

  // ─── Miscellaneous ─────────────────────────────────────
  repeat:      'repeat',
  plateCalc:   'circle-slice-8',
  demo:        'play-box-outline',
  notes:       'text-box-outline',
  target:      'target',
  muscle:      'arm-flex',
  clipboard:   'clipboard-list',
  browsePrograms: 'clipboard-text-search',
} as const;

export type AppIconName = keyof typeof AppIcons;
