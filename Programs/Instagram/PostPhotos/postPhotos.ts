import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import * as t from 'io-ts';
import { ElementHandle as EH, WebDeps as WD, WebProgram as WP } from 'launch-page';
import { devices } from 'puppeteer';

import { goto } from '../goto';

export namespace Models {
  const Photo = t.type({
    imagesSystemPath: t.string,
    description: t.string,
  });

  export interface Photo {
    imagesSystemPath: string;
    description: string;
  }

  export const Deps = t.type({
    photos: t.readonlyArray(Photo),
  });

  interface DepsT {
    photos: ReadonlyArray<Photo>;
  }

  export type Deps = Extract<t.TypeOf<typeof Deps>, DepsT>;
}

const openWindowNewPost = (): WP.WebProgram<void> =>
  pipe(
    WD.waitFor$x('//div[./*[@aria-label="Nuovo post"]]'),
    WP.map(A.head),
    WP.chain(
      O.match(() => WP.left(new Error("No new-post-btn found.")), EH.click())
    )
  );

const checkImage = (imageSystemPath: string): WP.WebProgram<void> =>
  (imageSystemPath.toLowerCase().endsWith("jpg") ||
    imageSystemPath.toLowerCase().endsWith("jpeg")) === false
    ? WP.left(new Error("Instagram only accepts jpeg/jpg images."))
    : fs.existsSync(imageSystemPath) === false
    ? WP.left(new Error("The image you specified does not exist."))
    : WP.of(undefined);

const nextStep = (): WP.WebProgram<void> =>
  pipe(
    WD.waitFor$x("//button[contains(text(),'Avanti')]"),
    WP.map(A.head),
    WP.chain(
      O.match(
        () => WP.left(new Error("No next-step-btn in post-photo.")),
        EH.click()
      )
    )
  );

const writeDescription = (description: string): WP.WebProgram<void> =>
  pipe(
    WD.waitFor$x(`//textarea[@aria-label='Scrivi una didascalia...']`),
    WP.map(A.head),
    WP.chain(
      O.match(
        () => WP.left(new Error("No textarea for description in post-photo.")),
        EH.click()
      )
    ),
    WP.chain(() => WD.keyboard.type(description))
  );

const sharePhoto = (): WP.WebProgram<void> =>
  pipe(
    WD.waitFor$x(`//button[contains(text(),'Condividi')]`),
    WP.map(A.head),
    WP.chain(
      O.match(
        () => WP.left(new Error("No share-button in post-photo.")),
        EH.click()
      )
    )
  );

const userlikePostPhoto = (photo: Models.Photo): WP.WebProgram<void> =>
  pipe(
    goto("it")("https://www.instagram.com/"),
    WP.chain(() => WD.waitFor$$('input[type="file"]')),
    WP.map((inputs) => inputs[inputs.length - 1]),
    WP.chainFirst(() => openWindowNewPost()),
    WP.chain(WP.delay(250)),
    WP.chainFirst(() => checkImage(photo.imagesSystemPath)),
    WP.chain((input) => EH.uploadFile(photo.imagesSystemPath)(input)),
    WP.chain(WP.delay(250)),
    WP.chain(() => nextStep()),
    WP.chain(() => writeDescription(photo.description)),
    WP.chain(() => sharePhoto()),
    WP.chainFirst(() =>
      WD.onReaderPage((page) =>
        WP.fromTaskK(() => () =>
          page.waitForNavigation({ waitUntil: "networkidle0" })
        )()
      )
    )
  );

const postPhotos = (running: TE.TaskEither<Error, boolean>) => (
  D: Models.Deps
): WP.WebProgram<void> =>
  pipe(
    WD.emulate(devices["iPhone 6"]),
    WP.chain(() =>
      pipe(
        WP.ask(),
        WP.chainTaskEitherK((r) => async () => {
          let res: WP.WebProgram<void> = WP.of(undefined);

          let stop: boolean = false;
          for (let index = 0; index < D.photos.length; index++) {
            if (stop) {
              break;
            }

            await pipe(
              userlikePostPhoto(D.photos[index]),
              WP.chainTaskEitherK(() => running),
              WP.match(
                (e) => {
                  res = WP.left(e);
                  stop = true;
                  console.error(e.message);
                },
                (keepGoing) => {
                  stop = !keepGoing;
                }
              )
            )(r)();
          }

          return res(r)();
        })
      )
    ),
    WP.chain(WP.delay(200050)),
    WP.map(() => console.log("postPhotos: done"))
  );

export default postPhotos;
