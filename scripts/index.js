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

const profileForm = profilePopup.querySelector('.popup__form');
const cardForm = cardPopup.querySelector('.popup__form');
const avatarForm = avatarPopup.querySelector('.popup__form');

const profileNameInput = profileForm.querySelector('.popup__input_type_name');
const profileAboutInput = profileForm.querySelector('.popup__input_type_description');

const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const avatarInput = avatarForm.querySelector('.popup__input_type_avatar-url');

const profileSubmitButton = profileForm.querySelector('.popup__button');
const cardSubmitButton = cardForm.querySelector('.popup__button');
const avatarSubmitButton = avatarForm.querySelector('.popup__button');

const popupImageElement = imagePopup.querySelector('.popup__image');
const popupCaptionElement = imagePopup.querySelector('.popup__caption');

const infoList = infoPopup.querySelector('.popup__info-list');
const previewList = infoPopup.querySelector('.popup__preview-list');

const infoDefinitionTemplate = document.querySelector('#popup-info-definition-template').content;
const infoPreviewTemplate = document.querySelector('#popup-info-user-preview-template').content;

let currentUserId = '';
let currentUserData = null;

const openPopup = (popup) => {
  popup.classList.add('popup_is-opened');
};

const closePopup = (popup) => {
  popup.classList.remove('popup_is-opened');
};

const renderLoading = (button, isLoading, loadingText = 'Сохранение...') => {
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }

  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
};

const renderUserInfo = (userData) => {
  currentUserData = userData;
  profileNameElement.textContent = userData.name;
  profileAboutElement.textContent = userData.about;
  profileImage.style.backgroundImage = `url('${userData.avatar}')`;
};

const openImagePopup = (cardData) => {
  popupImageElement.src = cardData.link;
  popupImageElement.alt = cardData.name;
  popupCaptionElement.textContent = cardData.name;
  openPopup(imagePopup);
};

const createInfoItem = (title, value) => {
  const item = infoDefinitionTemplate.querySelector('.popup__info-item').cloneNode(true);
  item.querySelector('.popup__info-term').textContent = title;
  item.querySelector('.popup__info-definition').textContent = value;
  return item;
};

const createPreviewItem = (title, subtitle) => {
  const item = infoPreviewTemplate.querySelector('.popup__preview-item').cloneNode(true);
  item.querySelector('.popup__preview-title').textContent = title;
  item.querySelector('.popup__preview-subtitle').textContent = subtitle;
  return item;
};

const formatDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const createCard = (cardData) => {
  const cardElement = cardTemplate.cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  const updateLikesView = () => {
    const isLiked = cardData.likes.some((user) => user._id === currentUserId);
    likeButton.classList.toggle('card__like-button_is-active', isLiked);
    likeCount.textContent = cardData.likes.length;
  };

  updateLikesView();

  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => {
      deleteCardById(cardData._id)
        .then(() => {
          cardElement.remove();
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  likeButton.addEventListener('click', () => {
    const isLiked = cardData.likes.some((user) => user._id === currentUserId);

    changeLikeCardStatus(cardData._id, isLiked)
      .then((updatedCard) => {
        cardData.likes = updatedCard.likes;
        updateLikesView();
      })
      .catch((err) => {
        console.log(err);
      });
  });

  cardImage.addEventListener('click', () => {
    openImagePopup(cardData);
  });

  return cardElement;
};

const renderCards = (cards) => {
  placesList.innerHTML = '';
  cards.forEach((cardData) => {
    placesList.append(createCard(cardData));
  });
};

const handleProfileSubmit = (evt) => {
  evt.preventDefault();

  renderLoading(profileSubmitButton, true, 'Сохранение...');

  setUserInfo({
    name: profileNameInput.value,
    about: profileAboutInput.value
  })
    .then((userData) => {
      renderUserInfo(userData);
      closePopup(profilePopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileSubmitButton, false);
    });
};

const handleAvatarSubmit = (evt) => {
  evt.preventDefault();

  renderLoading(avatarSubmitButton, true, 'Сохранение...');

  setUserAvatar({
    avatar: avatarInput.value
  })
    .then((userData) => {
      renderUserInfo(userData);
      avatarForm.reset();
      closePopup(avatarPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false);
    });
};

const handleCardSubmit = (evt) => {
  evt.preventDefault();

  renderLoading(cardSubmitButton, true, 'Создание...');

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then((cardData) => {
      placesList.prepend(createCard(cardData));
      cardForm.reset();
      closePopup(cardPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardSubmitButton, false);
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      infoList.innerHTML = '';
      previewList.innerHTML = '';

      const totalCards = cards.length;
      const myCards = cards.filter((card) => card.owner._id === currentUserId).length;
      const otherCards = totalCards - myCards;
      const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

      const sortedByDate = [...cards].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const firstCard = sortedByDate[0];
      const lastCard = sortedByDate[sortedByDate.length - 1];

      const mostLikedCard = cards.length
        ? cards.reduce((maxCard, card) => {
            return card.likes.length > maxCard.likes.length ? card : maxCard;
          }, cards[0])
        : null;

      infoList.append(createInfoItem('Всего карточек', String(totalCards)));
      infoList.append(createInfoItem('Моих карточек', String(myCards)));
      infoList.append(createInfoItem('Чужих карточек', String(otherCards)));
      infoList.append(createInfoItem('Всего лайков', String(totalLikes)));

      if (mostLikedCard) {
        infoList.append(
          createInfoItem(
            'Самая популярная',
            `${mostLikedCard.name} (${mostLikedCard.likes.length} лайков)`
          )
        );
      }

      if (firstCard) {
        infoList.append(
          createInfoItem(
            'Первая карточка',
            `${firstCard.name}, ${formatDate(new Date(firstCard.createdAt))}`
          )
        );
      }

      if (lastCard) {
        infoList.append(
          createInfoItem(
            'Последняя карточка',
            `${lastCard.name}, ${formatDate(new Date(lastCard.createdAt))}`
          )
        );
      }

      const ownersMap = new Map();

      cards.forEach((card) => {
        const ownerId = card.owner._id;
        const ownerName = card.owner.name || ownerId;

        if (!ownersMap.has(ownerId)) {
          ownersMap.set(ownerId, {
            name: ownerName,
            count: 0
          });
        }

        ownersMap.get(ownerId).count += 1;
      });

      const topOwners = [...ownersMap.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      if (topOwners.length === 0) {
        previewList.append(createPreviewItem('Нет данных', ''));
      } else {
        topOwners.forEach((owner, index) => {
          previewList.append(
            createPreviewItem(`${index + 1}. ${owner.name}`, `${owner.count} карточек`)
          );
        });
      }

      openPopup(infoPopup);
    })
    .catch((err) => {
      console.log(err);
    });
};

document.querySelectorAll('.popup').forEach((popup) => {
  popup.addEventListener('mousedown', (evt) => {
    if (
      evt.target.classList.contains('popup') ||
      evt.target.classList.contains('popup__close')
    ) {
      closePopup(popup);
    }
  });
});

document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector('.popup_is-opened');
    if (openedPopup) {
      closePopup(openedPopup);
    }
  }
});

profileEditButton.addEventListener('click', () => {
  profileNameInput.value = currentUserData ? currentUserData.name : '';
  profileAboutInput.value = currentUserData ? currentUserData.about : '';
  openPopup(profilePopup);
});

profileAddButton.addEventListener('click', () => {
  cardForm.reset();
  openPopup(cardPopup);
});

profileImage.addEventListener('click', () => {
  avatarInput.value = '';
  openPopup(avatarPopup);
});

logoElement.addEventListener('click', handleLogoClick);

profileForm.addEventListener('submit', handleProfileSubmit);
avatarForm.addEventListener('submit', handleAvatarSubmit);
cardForm.addEventListener('submit', handleCardSubmit);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    renderUserInfo(userData);
    renderCards(cards);
  })
  .catch((err) => {
    console.log(err);
  });