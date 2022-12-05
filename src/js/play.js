var player;
var list = [];

function loadVideo() {
  console.info(`loadVideo called`);

  (function loadYoutubeIFrameApiScript() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    tag.onload = onYoutubeIframeAPIReady;
  })();

  function onYoutubeIframeAPIReady() {
    window.YT.ready(function() {
      list.push(vid);
      player = new window.YT.Player("player", {
        videoId: vid,
        width: "device-width",
        height: "auto",
        playerVars: {
          "mute": 0,
          "autoplay": 0,
          "controls": 1,
          "enablejsapi": 1
        },
        events: {
          "onReady": onPlyaerReady,
          "onStateChange": onPlyaerStateChange
        }
      });
    });
  }
  
  function onPlyaerReady(event) {
    // event.target.playVideo();
    $("title").html(`play - ${vid}`);
    $("#list").html(`[ "${list.join(`" , "`)}" ]`);
    $("#nowplay").html(vid);
  }
  // let first = false;
  function onPlyaerStateChange(event) {
    // -1 시작전 / 0 종료 / 1 재생중 / 2 일시정지 / 3 버퍼링 / 4 동영상 신호
    if (event.data == 1) {
      console.log(`${vid} - playing`);
      $("title").html(`play - ${vid}`);
      $("#list").html(`[ "${list.join(`" , "`)}" ]`);
      $("#nowplay").html(vid);
      // if (!first) {
      //   first = true;
      //   event.target.unMute();
      //   event.target.setVolume(50);
      //   event.target.playVideo();
      // }
    }
    if (event.data == 0) {
      $.get(`/recommand?list=${list.join(",")}&vid=${vid}`, (data) => {
        if (data?.vid) {
          vid = data.vid;
          console.log(list);
          list.push(vid);
          console.log(list);
          player.loadVideoById({
            videoId: vid
          });
        }
      });
    }
  }
}

if (document.readyState !== "loading") {
  console.info(`document.readyState ==>`, document.readyState);
  loadVideo();
} else {
  document.addEventListener("DOMContentLoaded", function() {
    console.info(`DOMContentLoaded ==>`, document.readyState);
    loadVideo();
  });
}
