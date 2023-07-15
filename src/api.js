import axios from 'axios';

  export async function fetchImages(q, page, perPage) {
    const URL = "https://pixabay.com/api/";
    const KEY = "19222364-618594886f73d48fc0d49865a";
  
    const url = `${URL}?key=${KEY}&q=${q}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`;
    const response = await axios.get(url);
    return response.data;          
};

 