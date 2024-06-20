"use strict";

//! Selecting Elements and variable declaration
const categoryBtnEl = document.querySelector(".category-btn");
const navMenuEl = document.querySelector(".nav");
const categoryListContainer = document.querySelector(".navbar-menu");
const searchBtnEl = document.querySelector(".search-btn");
const searchInputEl = document.querySelector(".search-inpt");
const searchContainerEl = document.querySelector(".search-container");
const searchResultsContainer = document.querySelector(".search-results");
const singleProductContainer = document.querySelector(".product-container");
const sortBtnEl = document.querySelector(".sort-btn");

let isSorted = false;
let searchFlag = false;
let isClicked = false;

const API_URL = "https://dummyjson.com/products/";
let products = [];
let categoryElements = [];

//? Render spinner Function
const renderSpinner = () => {
  const html = `
          <div class="spinner-container">
            <img src="./assets/icon.svg" alt="Load spinner" />
          </div>
  `;
  return html;
};

//? Helper Functions
const fetchData = async (url, query = "") => {
  try {
    const response = await fetch(`${url}/${query}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const updateInnerHTML = (element, html) => {
  element.innerHTML = html;
};

const toggleClass = (element, ...classes) => {
  classes.forEach((cls) => element.classList.toggle(cls));
};

//? Render Categories Menu
const categoryDataFetch = async () => {
  try {
    const data = await fetchData(API_URL, "categories");
    categoryElements = data.map((item) => item.name);
    return categoryElements;
  } catch (err) {
    renderErrorMessage(err.message);
  }
};

const renderCategoriesMenu = () => {
  const html = categoryElements
    .map((el) => `<li><a class="category" href="#">${el}</a></li>`)
    .join("");
  updateInnerHTML(categoryListContainer, html);
};

const toggleCategoriesMenu = () => {
  toggleClass(navMenuEl, "display-hidden", "display-block");
  if (!isClicked) {
    renderCategoriesMenu();
    isClicked = true;
  } else {
    isClicked = false;
  }
};

categoryBtnEl.addEventListener("click", toggleCategoriesMenu);

// render Error Message Function
const renderErrorMessage = (message) => {
  const html = `<h2 class="error-message">${message}</h2>`;
  updateInnerHTML(searchResultsContainer, html);
};

const createProductObject = (product) => ({
  id: product.id,
  title: product.title,
  category: product.category,
  description: product.description,
  brand: product.brand,
  price: product.price,
  image: product.images[0],
  rating: product.rating,
  tags: product.tags,
  discountPercentage: product.discountPercentage,
  shipping: product.shippingInformation,
});

//? Render Products
const renderProduct = (product) => {
  const { title, category, price, discountPercentage, rating, image, id } =
    product;
  const html = `
    <li class="result-item" data-set="${id}">
      <div class="product-content">
        <div class="item-img">
          <img src="${image}" alt="${title} Photo" />
        </div>
        <div class="middle-content">
          <h4>${title}</h4>
          <p class="sub-heading">${
            category[0].toUpperCase() + category.slice(1)
          }</p>
          <p>
            <span class="old-price">$${(
              price -
              (discountPercentage / 100) * price
            ).toFixed(2)}</span>
            <span class="new-price">$${price.toFixed(2)}</span>
          </p>
        </div>
      </div>
      <div class="rating-content">
        <i class="fa-solid fa-star"></i>
        <span>${rating}</span>
      </div>
    </li>
  `;
  searchResultsContainer.innerHTML += html;
};

const renderProducts = (products) => {
  searchResultsContainer.innerHTML = "";
  products.forEach(renderProduct);
};

const loadAllProducts = async () => {
  searchResultsContainer.innerHTML = renderSpinner();
  try {
    const data = await fetchData(API_URL);
    products = data.products.map(createProductObject);
    renderProducts(products);
  } catch (error) {
    renderErrorMessage(error.message);
  }
};

const loadSortedProducts = async () => {
  try {
    const data = await fetchData(API_URL, "?sortBy=title&order=asc");
    products = data.products.map(createProductObject);
    renderProducts(products);
  } catch (error) {
    renderErrorMessage(error.message);
  }
};

//? Render Single Product
const renderSingleProduct = (e) => {
  const productItemEl = e.target.closest(".result-item");
  if (!productItemEl) return;
  const product = products.find((p) => p.id === +productItemEl.dataset.set);
  productDOMRender(product);
};

const productDOMRender = (product) => {
  //prettier-ignore
  const {
    title,description,brand,price,image,rating,tags,discountPercentage, shipping,
  } = product;
  const renderRating = () => {
    return Array.from(
      { length: Math.round(rating) },
      () => `<li><i class="fa-solid fa-star"></i></li>`
    ).join("");
  };

  const html = `
    <div class="product-container">
      <div class="product-img">
        <img src="${image}" alt="${title} Photo" />
      </div>
      <div class="product-heading">
        <h3 class="product-title">${title}</h3>
        <p>
          <span class="old-price">$${(
            price -
            (discountPercentage / 100) * price
          ).toFixed(2)}</span>
          <span class="new-price">$${price}</span>
        </p>
      </div>
      <p class="product-description">${description}</p>
      <div class="product-details">
        <div class="brands">
          <p class="brand-type">Brand: <span>${brand}</span></p>
          <p class="shipping-time">${shipping}</p>
        </div>
        <div class="ratings-container">
          <ul class="ratings">${renderRating()}</ul>
          <div class="tag-btns">
            <button class="tag-btn">${tags[0]}</button>
            <button class="tag-btn">${tags[1] ? tags[1] : tags[0]}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  updateInnerHTML(singleProductContainer, html);
};

//? Sort Function
sortBtnEl.addEventListener("click", () => {
  searchResultsContainer.innerHTML = renderSpinner();
  if (isSorted) {
    loadAllProducts();
  } else {
    loadSortedProducts();
  }
  isSorted = !isSorted;
});

//? Search Function
const renderSearchProducts = async (e) => {
  e.preventDefault();
  if (!searchFlag) {
    toggleClass(searchInputEl, "hidden");
    toggleClass(searchContainerEl, "search-style");
    searchFlag = true;
  } else {
    toggleClass(searchInputEl, "hidden");
    toggleClass(searchContainerEl, "search-style");
    try {
      const inputText = searchInputEl.value.trim();
      if (!inputText) return;
      searchResultsContainer.innerHTML = renderSpinner();

      const data = await fetchData(API_URL, `search?q=${inputText}`);
      searchInputEl.value = "";
      if (data.products.length === 0) {
        throw new Error("No products found.");
      }
      products = data.products.map(createProductObject);
      renderProducts(products);
    } catch (error) {
      renderErrorMessage(error.message);
    }
    searchFlag = false;
  }
};

searchContainerEl.addEventListener("submit", renderSearchProducts);
searchResultsContainer.addEventListener("click", renderSingleProduct);
window.addEventListener("load", categoryDataFetch);
loadAllProducts();
