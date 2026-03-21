'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Flip: any;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Flip = require('gsap/Flip').Flip;
  gsap.registerPlugin(ScrollTrigger, Flip);
} else {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger, Flip };
