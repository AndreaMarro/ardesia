/**
 * ELAB Videocorsi — local videos bundled with the app.
 *
 * Source files live in PRODOTTO/newcartella/videos and are copied to
 * public/videos so the homepage and Lavagna VideoFloat use the same assets.
 */
import { LOCAL_TIKTOK_VIDEOS } from './local-tiktok-videos';

export const VIDEO_COURSES = LOCAL_TIKTOK_VIDEOS.map(video => ({ ...video }));

export default VIDEO_COURSES;
