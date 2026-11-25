/**
 * Pre-paint motion flag (PLAN.md §7E, approved).
 *
 * Runs synchronously in <head>, before first paint:
 * - With reduced motion requested, it does nothing, so content is never hidden.
 * - Otherwise it sets `data-motion-ready` on <html>, which enables the
 *   "start hidden" styles in motion.css.
 * - A 1.5 s failsafe removes the flag (revealing everything) unless the client
 *   motion layer has claimed it by setting `window.__motionClaimed = true`.
 *
 * - It also restores the visitor's "Pause motion" choice (`data-motion-paused`,
 *   see MotionToggle), so looping animations never start when paused.
 *
 * With JavaScript off, the script never runs and nothing is hidden.
 */
export const MOTION_FAILSAFE_MS = 1500

export const motionBootScript = `(function(){try{var d=document.documentElement;try{if(localStorage.getItem('motion-paused'))d.setAttribute('data-motion-paused','')}catch(e){}if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('data-motion-ready','');window.__motionArmed=true;window.__motionFailsafe=setTimeout(function(){if(!window.__motionClaimed){d.removeAttribute('data-motion-ready');d.setAttribute('data-motion-fallback','')}},${MOTION_FAILSAFE_MS})}catch(e){}})()`
