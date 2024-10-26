export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const getBackgroundImageMap = () => ({
  music: '/images/categories/music_bg.jpg',
  film: '/images/categories/film_bg.jpg',
  history: '/images/categories/history_bg.jpg',
  geography: '/images/categories/geography_bg.jpg',
  vehicles: '/images/categories/vehicles_bg.jpg',
  sports: '/images/categories/sports_bg.jpg'
});