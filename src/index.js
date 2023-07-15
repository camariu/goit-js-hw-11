 

import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api.js';
import './css/style.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const submitForm = document.querySelector('form#search-form')
const gallery = document.querySelector('div.gallery')
const loadMoreBtn = document.querySelector('button.load-more')
const header = document.querySelector('#myHeader')
 
 
const perPage = 40;
let page = 1;
let searchPhoto = '';

loadMoreBtn.classList.replace('load-more', 'loader');
loadMoreBtn.innerHTML = null;
loadMoreBtn.classList.add('is-hidden');
 
 
function onSubmitForm(event) {
  event.preventDefault()
  gallery.innerHTML = '';
  page = 1;
  const { searchQuery } = event.currentTarget.elements;
  searchPhoto = searchQuery.value.trim().toLowerCase().split(' ').join('+');

  if (searchPhoto === '') {
    Notify.info('Enter your request, please!', {
      position: 'center-center',
    });
    return;
  }

  fetchImages(searchPhoto, page, perPage)
    .then(data => {
      const searchResults = data.hits;
      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          {
            position: 'center-center',
          }
        );
      } else {
        Notify.info(`Hooray! We found ${data.totalHits} images.`);
        createMarkup(searchResults);
        lightbox.refresh();
      }
      if (data.totalHits > perPage) {
        loadMoreBtn.classList.remove('is-hidden');
        window.addEventListener('scroll', loadMorePage);
      }
      smoothScroll();
    })
    .catch(onError);

  event.currentTarget.reset();
}

submitForm.addEventListener('submit', onSubmitForm);

function createMarkup(searchResults) {
  const photosArray = searchResults.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `<div class="photo-card">
        <div class="photo-wrap">
            <a class="photo-link" href="${largeImageURL}">
                <img class="photo" src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
            </a>
        </div>
        <div class="info">
            <p class="info-item">
            <b><span class = "info-info">Likes:</span> ${likes}</b>
            </p>
            <p class="info-item">
            <b><span class = "info-info">Views:</span> ${views}</b>
            </p>
            <p class="info-item">
            <b><span class = "info-info">Comments:</span> ${comments}</b>
            </p>
            <p class="info-item">
            <b><span class = "info-info">Downloads:</span> ${downloads}</b>
            </p>
        </div>
        </div>`;
    }
  );
  gallery.insertAdjacentHTML('beforeend', photosArray.join(''));
}

function onClickLoadMore() {
  page += 1;
  fetchImages(searchPhoto, page, perPage)
    .then(data => {
      const searchResults = data.hits;
      const numberOfPage = Math.ceil(data.totalHits / perPage);

      createMarkup(searchResults);
      if (page === numberOfPage) {
        loadMoreBtn.classList.add('is-hidden');
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );

        window.removeEventListener('scroll', loadMorePage);
      }
      lightbox.refresh();
      smoothScroll();
    })
    .catch(onError);
}



function loadMorePage() {
  if (endOfPage()) {
    onClickLoadMore();
  }
}

function endOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}


function onError() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    {
      position: 'center-center',
    }
  );
}


let lightbox = new SimpleLightbox('.photo-wrap a');

window.onscroll = function () {
  fixedHeader();
};

const fixed = header.offsetTop;
function fixedHeader() {
  if (window.scrollY > fixed) {
    header.classList.add('fixed');
  } else {
    header.classList.remove('fixed');
  }
}


function smoothScroll() {
  const cardsPerPage = 40;
  let cardsTotal = document.querySelectorAll('div.gallery-wrap').length;

  if (cardsTotal > cardsPerPage) {
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}