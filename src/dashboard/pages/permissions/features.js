import { IconBook, IconCamera, IconFilm, IconImage, IconMic, IconMotion, IconPlay, IconStoryboard, IconUser } from '../../ui/DashIcons.jsx';

/**
 * The nine Cinemor features a job role can be given, in the order shown in the table and in the Create Job Role window.
 * `id` is what the backend sees (see permissionsModel.js); `label` is what people see.
 */
export const FEATURES = [
  { id: 'storyCreation', label: 'Story Creation', color: '#3b82f6', icon: IconBook },
  { id: 'storyboardCreation', label: 'Storyboard Creation', color: '#a855f7', icon: IconStoryboard },
  { id: 'characterCreation', label: 'Character Creation', color: '#10b981', icon: IconUser },
  { id: 'sceneCreation', label: 'Scene Creation', color: '#f97316', icon: IconFilm },
  { id: 'shotCreation', label: 'Shot Creation', color: '#ec4899', icon: IconCamera },
  { id: 'videoGeneration', label: 'Video Generation', color: '#6366f1', icon: IconPlay },
  { id: 'imageGeneration', label: 'Image Generation', color: '#14b8a6', icon: IconImage },
  { id: 'characterAnimation', label: 'Character Animation', color: '#8b5cf6', icon: IconMotion },
  { id: 'voiceGeneration', label: 'Voice Generation', color: '#eab308', icon: IconMic },
];

// every tool gets this colour in the table's column headings
export const TOOL_COLOR = '#0ea5e9';
