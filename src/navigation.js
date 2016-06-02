import Cache from './cache'
import {Request} from './request'

export const Navigation = {

  /*
  ** 
  */
  onVisit: function(path) {
    console.log("WAS I CALLED?????????")
    let req = Request.get(path)
  },

  /*
  **
  */
  onLeave: function(path) {
  }
}
