import { Injectable, Inject } from '@angular/core';
import * as $ from 'jquery';

@Injectable()
export class AnimationService {
    constructor() {}

    /**
     * Changes an animation by providing the class of the HTML element
     * and the name of the animation that need to be changed instead of the old one.
     * @param className The name of the class of the HTML element
     * @param animationName The name of the animation that need to be changed (should be in the animation folder) 
     */
    changeAnimation(className: string, animationName: string) {
        $(`.${className}`).attr('src', 'animation/' + animationName + '.mp4');
    }
}