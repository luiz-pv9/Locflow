/*
** Custom 'log' function for Locflow. It just adds a nice [Locflow] before
** the given arguments.
*/
export function log() {
  let args = Array.prototype.slice.call(arguments)
  args.unshift('[Locflow]')
  console.log.apply(console, args)
}
