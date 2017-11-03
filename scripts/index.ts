import { run } from './graph';
import { bootstrapDOM } from './helpers';

if ( typeof document !== "undefined" ) {
  document.addEventListener("DOMContentLoaded", () => {

    run();
    
  });

}