// --------------------------
// Get Infos for Action
// --------------------------
const getActionHref: () => WP.WebProgram<string> = () =>
  pipe(
    EH.$x(D.settings.message.link.relativeXPath)(messageWithAction),
    WP.chain((els) =>
      els.length === 1
        ? WP.of(els[0])
        : pipe(
            EH.getInnerText(messageWithAction),
            WP.chain((text) =>
              WP.left(
                new Error(
                  `Found ${els.length} HTMLAnchorElement(s) containing 'http'.` +
                    O.match<string, string>(
                      () => `No text found in message`,
                      (t) => `Text of message is: ${t}`
                    )(text)
                )
              )
            )
          )
    ),
    WP.chain(EH.getHref),
    WP.chain(
      O.match(() => WP.left(new Error("No link at bot message")), WP.of)
    ),
    WP.orElseStackErrorInfos({
      message: `In message with bot ${D.nameOfBot}`,
      nameOfFunction: "getActionHref",
      filePath: ABSOLUTE_PATH,
    })
  );
// --------------------------
// Implementations of Actions
// --------------------------
const implementationsOfActions: {
  [k in StringLiteralOfOutcomeOfAction]: (
    url: URL
  ) => WP.WebProgram<OutcomeOfAction>;
} = {
  Follow: (url: URL) =>
    pipe(
      FollowUser.followUser({
        language: I.language,
        profileUrl: url,
        options: { allowPrivate: false },
      }),
      WP.chain((outputOfFollowUser) =>
        outputOfFollowUser._tag === "NotFollowed"
          ? WP.of(returnSkip(outputOfFollowUser))
          : pipe(
              FollowUser.followUser({
                language: I.language,
                profileUrl: url,
                options: { allowPrivate: false },
              }),
              WP.map((outputOfCheck) =>
                outputOfCheck._tag === "NotFollowed"
                  ? returnConfirm(outputOfFollowUser)
                  : returnEnd(outputOfCheck)
              )
            )
      ),
      WP.orElseStackErrorInfos({
        message: "",
        nameOfFunction: "Follow",
        filePath: ABSOLUTE_PATH,
      })
    ),
  Like: (url: URL) =>
    pipe(
      LikeToPost.likeToPost({
        language: I.language,
        urlOfPost: url,
        options: {},
      }),
      WP.chain((outputOfLike) =>
        outputOfLike._tag === "NotLiked"
          ? WP.of(returnSkip(outputOfLike))
          : pipe(
              LikeToPost.likeToPost({
                language: I.language,
                urlOfPost: url,
                options: {},
              }),
              WP.map((outputOfCheck) =>
                outputOfCheck._tag === "NotLiked"
                  ? returnConfirm(outputOfLike)
                  : returnEnd(outputOfCheck)
              )
            )
      ),
      WP.orElseStackErrorInfos({
        message: "",
        nameOfFunction: "Like",
        filePath: ABSOLUTE_PATH,
      })
    ),
  WatchStory: (url: URL) =>
    pipe(
      WatchStoryAtUrl.watchStoryAtUrl({
        language: I.language,
        storyUrl: url,
        options: {},
      }),
      WP.map((o) =>
        o._tag === "AllWatched" ? returnConfirm(o) : returnSkip(o)
      ),
      WP.orElseStackErrorInfos({
        message: "",
        nameOfFunction: "WatchStory",
        filePath: ABSOLUTE_PATH,
      })
    ),
  Comment: (url: URL) =>
    WP.of(returnSkip({ message: "Comment is not implemented", url: url.href })),
  Extra: (url: URL) =>
    WP.of(returnSkip({ message: "Extra is not implemented", url: url.href })),
};
