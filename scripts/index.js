import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardById,
  changeLikeCardStatus
} from './api.js';

const profileEditButton = document.querySelector('.profile__edit-button');
const profileAddButton = document.querySelector('.profile__add-button');
const profileImage = document.querySelector('.profile__image');
const logoElement = document.querySelector('.header__logo');

const profileNameElement = document.querySelector('.profile__title');
const profileAboutElement = document.querySelector('.profile__description');

const placesList = document.querySelector('.places__list');
const cardTemplate = document.querySelector('.template').content.querySelector('.card');

const profilePopup = document.querySelector('.popup_type_edit');
const cardPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');
const avatarPopup = document.querySelector('.popup_type_avatar');
const infoPopup = document.querySelector('.popup_type_info');
const confirmPopup = document.querySelector('.popup_type_confirm');

const profileForm = profilePopup.querySelector('.popup__form');
const cardForm = cardPopup.querySelector('.popup__form');
const avatarForm = avatarPopup.querySelector('.popup__form');
const confirmForm = confirmPopup.querySelector('.popup__form');

const profileNameInput = profileForm.querySelector('.popup__input_type_name');
const profileAboutInput = profileForm.querySelector('.popup__input_type_description');

const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const avatarInput = avatarForm.querySelector('.popup__input_type_avatar-url');

const profileSubmitButton = profileForm.querySelector('.popup__button');
const cardSubmitButton = cardForm.querySelector('.popup__button');
const avatarSubmitButton = avatarForm.querySelector('.popup__button');
const confirmSubmitButton = confirmForm.querySelector('.popup__button');

const popupImageElement = imagePopup.querySelector('.popup__image');
const popupCaptionElement = imagePopup.querySelector('.popup__caption');

const statsContainer = infoPopup.querySelector('.popup__stats');
const chipsContainer = infoPopup.querySelector('.popup__chips');

let currentUserId = '';
let currentUserData = null;
let cardToDeleteId = '';
let cardToDeleteElement = null;

function openPopup(popup) {
  popup.classList.add('popup_is-opened');
}

function closePopup(popup) {
  popup.classList.remove('popup_is-opened');
}

function renderLoading(button, isLoading, loadingText) {
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }

  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

function renderUserInfo(userData) {
  currentUserData = userData;
  profileNameElement.textContent = userData.name;
  profileAboutElement.textContent = userData.about;
  profileImage.style.backgroundImage = `url('${userData.avatar}')`;
}

function openImagePopup(cardData) {
  popupImageElement.src = cardData.link;
  popupImageElement.alt = cardData.name;
  popupCaptionElement.textContent = cardData.name;
  openPopup(imagePopup);
}

function createStatItem(label, value) {
  const stat = document.createElement('div');
  stat.classList.add('popup__stat');

  const statLabel = document.createElement('span');
  statLabel.classList.add('popup__stat-label');
  statLabel.textContent = label;

  const statValue = document.createElement('span');
  statValue.classList.add('popup__stat-value');
  statValue.textContent = value;

  stat.append(statLabel, statValue);

  return stat;
}

function createChip(text) {
  const chip = document.createElement('span');
  chip.classList.add('popup__chip');
  chip.textContent = text;
  return chip;
}

function createCard(cardData) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  function updateLikesView() {
    const isLiked = cardData.likes.some(function (user) {
      return user._id === currentUserId;
    });

    likeButton.classList.toggle('card__like-button_is-active', isLiked);
    likeCount.textContent = cardData.likes.length;
  }

  updateLikesView();

  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', function () {
      cardToDeleteId = cardData._id;
      cardToDeleteElement = cardElement;
      openPopup(confirmPopup);
    });
  }

  likeButton.addEventListener('click', function () {
    const isLiked = cardData.likes.some(function (user) {
      return user._id === currentUserId;
    });

    changeLikeCardStatus(cardData._id, isLiked)
      .then(function (updatedCard) {
        cardData.likes = updatedCard.likes;
        updateLikesView();
      })
      .catch(function (err) {
        console.log(err);
      });
  });

  cardImage.addEventListener('click', function () {
    openImagePopup(cardData);
  });

  return cardElement;
}

function renderCards(cards) {
  placesList.innerHTML = '';

  cards.forEach(function (cardData) {
    placesList.append(createCard(cardData));
  });
}

function handleProfileSubmit(evt) {
  evt.preventDefault();

  renderLoading(profileSubmitButton, true, 'Сохранение...');

  setUserInfo({
    name: profileNameInput.value,
    about: profileAboutInput.value
  })
    .then(function (userData) {
      renderUserInfo(userData);
      closePopup(profilePopup);
    })
    .catch(function (err) {
      console.log(err);
    })
    .finally(function () {
      renderLoading(profileSubmitButton, false, 'Сохранение...');
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  renderLoading(avatarSubmitButton, true, 'Сохранение...');

  setUserAvatar({
    avatar: avatarInput.value
  })
    .then(function (userData) {
      renderUserInfo(userData);
      avatarForm.reset();
      closePopup(avatarPopup);
    })
    .catch(function (err) {
      console.log(err);
    })
    .finally(function () {
      renderLoading(avatarSubmitButton, false, 'Сохранение...');
    });
}

function handleCardSubmit(evt) {
  evt.preventDefault();

  renderLoading(cardSubmitButton, true, 'Создание...');

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then(function (cardData) {
      placesList.prepend(createCard(cardData));
      cardForm.reset();
      closePopup(cardPopup);
    })
    .catch(function (err) {
      console.log(err);
    })
    .finally(function () {
      renderLoading(cardSubmitButton, false, 'Создание...');
    });
}

function handleConfirmDeleteSubmit(evt) {
  evt.preventDefault();

  if (!cardToDeleteId || !cardToDeleteElement) {
    return;
  }

  renderLoading(confirmSubmitButton, true, 'Удаление...');

  deleteCardById(cardToDeleteId)
    .then(function () {
      cardToDeleteElement.remove();
      closePopup(confirmPopup);
      cardToDeleteId = '';
      cardToDeleteElement = null;
    })
    .catch(function (err) {
      console.log(err);
    })
    .finally(function () {
      renderLoading(confirmSubmitButton, false, 'Удаление...');
    });
}

function handleLogoClick() {
  getCardList()
    .then(function (cards) {
      statsContainer.innerHTML = '';
      chipsContainer.innerHTML = '';

      const uniqueUsers = new Map();
      let totalLikes = 0;

      cards.forEach(function (card) {
        totalLikes += card.likes.length;
        uniqueUsers.set(card.owner._id, card.owner.name || card.owner._id);
      });

      const usersLikes = new Map();

      cards.forEach(function (card) {
        const ownerId = card.owner._id;
        const ownerName = card.owner.name || ownerId;

        if (!usersLikes.has(ownerId)) {
          usersLikes.set(ownerId, {
            name: ownerName,
            likes: 0
          });
        }

        usersLikes.get(ownerId).likes += card.likes.length;
      });

      const usersLikesArray = Array.from(usersLikes.values());

      let maxLikesFromOne = 0;
      let likesChampion = 'Нет данных';

      if (usersLikesArray.length > 0) {
        const champion = usersLikesArray.reduce(function (best, user) {
          return user.likes > best.likes ? user : best;
        });

        maxLikesFromOne = champion.likes;
        likesChampion = champion.name;
      }

      const popularCards = cards
        .slice()
        .sort(function (a, b) {
          return b.likes.length - a.likes.length;
        })
        .slice(0, 3);

      statsContainer.append(
        createStatItem('Всего пользователей:', String(uniqueUsers.size))
      );
      statsContainer.append(
        createStatItem('Всего лайков:', String(totalLikes))
      );
      statsContainer.append(
        createStatItem('Максимально лайков от одного:', String(maxLikesFromOne))
      );
      statsContainer.append(
        createStatItem('Чемпион лайков:', likesChampion)
      );

      if (popularCards.length === 0) {
        chipsContainer.append(createChip('Нет данных'));
      } else {
        popularCards.forEach(function (card) {
          chipsContainer.append(createChip(card.name));
        });
      }

      openPopup(infoPopup);
    })
    .catch(function (err) {
      console.log(err);
    });
}

document.querySelectorAll('.popup').forEach(function (popup) {
  popup.addEventListener('mousedown', function (evt) {
    if (
      evt.target.classList.contains('popup') ||
      evt.target.classList.contains('popup__close')
    ) {
      closePopup(popup);
    }
  });
});

document.addEventListener('keydown', function (evt) {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector('.popup_is-opened');

    if (openedPopup) {
      closePopup(openedPopup);
    }
  }
});

profileEditButton.addEventListener('click', function () {
  profileNameInput.value = currentUserData ? currentUserData.name : '';
  profileAboutInput.value = currentUserData ? currentUserData.about : '';
  openPopup(profilePopup);
});

profileAddButton.addEventListener('click', function () {
  cardForm.reset();
  openPopup(cardPopup);
});

profileImage.addEventListener('click', function () {
  avatarInput.value = '';
  openPopup(avatarPopup);
});

logoElement.addEventListener('click', handleLogoClick);

profileForm.addEventListener('submit', handleProfileSubmit);
avatarForm.addEventListener('submit', handleAvatarSubmit);
cardForm.addEventListener('submit', handleCardSubmit);
confirmForm.addEventListener('submit', handleConfirmDeleteSubmit);

Promise.all([getCardList(), getUserInfo()])
  .then(function (result) {
    const cards = result[0];
    const userData = result[1];

    currentUserId = userData._id;
    renderUserInfo(userData);
    renderCards(cards);
  })
  .catch(function (err) {
    console.log(err);
  });