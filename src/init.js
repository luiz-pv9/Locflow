import {LocflowDef} from './locflow'

const Locflow = window.Locflow = new LocflowDef()
window.addEventListener('load', () => { Locflow.emit(EVENT_READY) })
