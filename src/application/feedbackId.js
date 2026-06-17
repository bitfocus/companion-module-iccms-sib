/**
 * All feedbacks as enum (not user right now).
 * @type {{ClockIsRunning: string, ClockIsStopped: string}}
 */
export const feedbackId = {
  /**
   * Clock is running, change background color.
   */
  ClockIsRunning: 'sib_feedback_clock_is_running',

  /**
   * Clock is stopped, change background color.
   */
  ClockIsStopped: 'sib_feedback_clock_is_stopped',

  /**
   * If combined output view is active, change background color.
   */
  ViewIsActive: 'sib_co_view_is_active',

  /**
   * If combined output view is not active, change background color.
   */
  ViewIsNotActive: 'sib_co_view_is_not_active',
}
