export * from "./Like";
export * from "./Follow";
export * from "./WatchStory";
export * from "./goto";
export * from "./postNewMedia";
export * from "./login";

import { program as GFProgram } from './GrowFollowers';
import { program as PPProgram } from './PostPhotos';

export default [PPProgram, GFProgram];
