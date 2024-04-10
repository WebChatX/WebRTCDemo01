let localMediaStream = null;
let pc = null;
const localIcecandidateList = [];

document.querySelector(".server textarea").value = JSON.stringify({
  iceServers: [
    { urls: "stun:147.109.16.111:3478" },
    {
      urls: "turn:147.109.16.111:3478",
      username: "liliang",
      credential: "123456",
    },
  ],
  iceTransportPolicy: "all",
});

// 复制文本到剪贴板
const copyText = (selector) => {
  const selectEl = document.querySelector(selector);
  selectEl.select();
  if (document.execCommand("copy")) {
    console.log("复制成功");
  } else {
    console.log("复制失败");
  }
};

// 创建RTCPeerConnection对象
const createPC = async () => {
  const configStr = document.querySelector(".server textarea").value;
  const config = JSON.parse(configStr);
  console.log(config);
  pc = new RTCPeerConnection(config);

  localMediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localMediaStream.getTracks().forEach((track) => {
    pc.addTrack(track, localMediaStream);
  });

  // icecandidate事件监听
  pc.addEventListener("icecandidate", (event) => {
    console.log("收集到本地candidate", event.candidate);
    if (event.candidate) {
      localIcecandidateList.push(event.candidate);
    } else {
      console.log("本地candidate收集完成");
      const localIcecandidateListStr = JSON.stringify(localIcecandidateList);
      document.querySelector(".local-candidate textarea").value =
        localIcecandidateListStr;
    }
  });
  // track事件监听
  pc.addEventListener("track", (event) => {
    console.log("track事件触发");
    const remoteMediaStream = event.streams[0];
    document.querySelector("#remote-video").srcObject = remoteMediaStream;
  });
};

// 创建并处理本地SDP
const createOfferSDP = async () => {
  const offer = await pc.createOffer();
  pc.setLocalDescription(offer);
  console.log("创建本地SDP成功");
  document.querySelector(".offer textarea").value = JSON.stringify(offer);
};

// 接收并处理远程SDP
const handleAnswerSDP = () => {
  const answer = JSON.parse(document.querySelector(".answer textarea").value);
  console.log(answer);
  pc.setRemoteDescription(answer);
};

// 接受并处理远程candidate
const handleCandidate = () => {
  const remoteIcecandidateList = JSON.parse(
    document.querySelector(".remote-candidate textarea").value
  );
  remoteIcecandidateList.forEach((candidate) => {
    pc.addIceCandidate(candidate);
  });
};
