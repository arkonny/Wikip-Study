import graphqlCall from "../graphql/graphqlCall.js";
import { checkToken } from "../graphql/queries.js";

const appendAlert = (alertElement, message, type) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertElement.append(wrapper);
};

const setCookie = (name, value) => {
  document.cookie = `${name}=${value}`;
};

const getCookie = (name) => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
  return cookie ? cookie : "";
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC`;
};

const sessionCheck = async () => {
  if (!getCookie("token") || !getCookie("user_name") || !getCookie("id")) {
    return null;
  }
  const response = await graphqlCall(checkToken, {});
  if (!response.ok) {
    return null;
  }
  const dataResponse = await response.json();
  if (
    dataResponse.errors ||
    dataResponse.data.checkToken.message !== "Token is valid"
  ) {
    deleteCookie("token");
    deleteCookie("user_name");
    deleteCookie("id");
    return null;
  }
  return dataResponse.data.checkToken.user;
};

const addQuizCardEdit = (quizCard) => {
  return `
  <div class="col">
    <div class="card">
      <img
        src="https://via.placeholder.com/300x150"
        alt="Quiz image"
        class="card-img-top"
      />
      <div class="card-body">
        <h5 class="card-title">${quizCard.quiz_name}</h5>
        <a class="btn btn-primary" href="play-quiz.html?id=${quizCard.id}" title="Open quiz">
          Start the quiz
        </a>
        <a class="btn btn-secondary" href="edit-quiz.html?id=${quizCard.id}" title="Edit quiz">
          Edit
        </a>
      </div>
    </div>
  </div>
  `;
};

const addQuizCard = (quizCard) => {
  return `
  <div class="col">
    <div class="card">
      <img
        src="https://via.placeholder.com/300x150"
        alt="Quiz image"
        class="card-img-top"
      />
      <div class="card-body">
        <h5 class="card-title">${quizCard.quiz_name}</h5>
        <a class="btn btn-primary" href="play-quiz.html?id=${quizCard.id}" title="Open quiz">
          Start the quiz
        </a>
      </div>
    </div>
  </div>
  `;
};

const graphqlCallResponse = async (query, variables, responseElement) => {
  const response = await graphqlCall(query, variables);
  if (!response.ok) {
    appendAlert(responseElement, "Connection failed", "danger");
    throw new Error(response.statusText);
  }
  const dataResponse = await response.json();
  if (dataResponse.errors) {
    appendAlert(responseElement, dataResponse.errors[0].message, "danger");
    throw new Error(dataResponse.errors[0].message);
  }
  return dataResponse;
};

const uploadURL = "http://localhost:3002/api/v1";

const uploadImage = async (imageInput) => {
  if (!imageInput.files[0]) return;
  const image = imageInput.files[0];
  const formData = new FormData();
  formData.append("file", image);
  const response = await fetch(`${uploadURL}/upload`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getCookie("token")}`,
    },
    body: formData,
  });
  const imageUploadData = await response.json();
  if (!imageUploadData.data) {
    throw new Error("Image upload failed");
  }
  return imageUploadData.data.filename.toString();
};

export {
  appendAlert,
  setCookie,
  getCookie,
  deleteCookie,
  sessionCheck,
  addQuizCard,
  addQuizCardEdit,
  graphqlCallResponse,
  uploadImage,
};
