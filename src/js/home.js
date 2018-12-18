(async function load(){
  //await
  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');
  const $featuringContainer = document.getElementById("featuring");
 const $modalTitle = $modal.querySelector("h1");
 const $modalImage = $modal.querySelector("img");
 const $modalDescription = $modal.querySelector('p');

 async function getData(url){
 const response =  await fetch(url);
 const data = await response.json();
 if(data.data.movie_count>0){
   return data;
 }
throw new Error('No se encontró ningun resultado');
}

  const $form = document.getElementById("form");
  const $home = document.getElementById("home");

    function setAttributes($element, attributes){
      for(const key in attributes){
          $element.setAttribute(key,attributes[key]);
      }
    }

  $form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    $home.classList.add('search-active');
    const $loader = document.createElement('img');
    setAttributes($loader,{

      src:'src/images/loader.gif',
      height:50,
      width:50,
    });
    $featuringContainer.append($loader);
    const data = new FormData($form);
    try{

      const {
      data:{
        movies: pelis
      }
    } = await getData(`https://yts.am/api/v2/list_movies.json?limit=1&query_term=${data.get('name')}`);
   
    const HTMLString = featuringTemplate(pelis[0]);
    $featuringContainer.innerHTML = HTMLString;
    }catch(error){
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
    
  });

  function featuringTemplate(pelicula){
    return (
        `<div class='featuring'>
         <div class='featuring-image'>
         <img src='${pelicula.medium_cover_image}' width= '70' height='100'>
         </div>
         <div class='featuring-content'>
         <p class='featuring-title'>Pelicula encontrada</p>
         <p class='featuring-album'>${pelicula.title}</p>
         </div>
         </div>
        `
      );
  }

  function createTemplate(HTMLString){
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function videoItemTemplate(movie,category){
    return (
   `<div class='primaryPlaylistItem' data-id='${movie.id}' data-category='${category}'>
    <div class='primaryPlaylistItem-image'>
    <img src='${movie.medium_cover_image}'>
    </div>
    <h4 class='primaryPlaylistItem-title'>
    ${movie.title}
    </h4>
    </div>`
  );

  }
  function showModal($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id,category);
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src',data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

  function findMovie(id,category){
    switch(category){
      case 'action':
       return findById(actionList,id);
      break;
      case 'drama':
      return  findById(dramaList,id);
      break;
      case 'animation':
      return  findById(animationList, id);
      break;
    }
    
  }

  function findById(list, id){
   return list.find(movie=> movie.id === parseInt(id,10)); 
  }


  $hideModal.addEventListener('click', hideModal);
  function hideModal(){
     $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }
  const $actionContainer = document.querySelector('#action');
  function addEventClick($element){
    $element.addEventListener('click', function(){
  
        showModal($element);
    });
  }
  function renderMoviesList(list, $container, category){
     $container.children[0].remove();
    list.forEach((item) =>{
    //debugger
    const htmString = videoItemTemplate(item, category);
    const movieElement  = createTemplate(htmString);
    $container.append(movieElement);
    const image =  movieElement.querySelector('img');
    image.addEventListener('load',(event)=>{
      event.srcElement.classList.add('fadeIn');
    });
    
    addEventClick(movieElement);
   // $actionContainer.innerHTML += htmString;
  });
  }
  
   async function cacheExist(category){
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem(listName);
    if(cacheList){
      return JSON.parse(cacheList);
    }
    const {data:{movies:data}} =  await getData("https://yts.am/api/v2/list_movies.json?genre=action");
    window.localStorage.setItem(listName, JSON.stringify(data));
    return data;
  }

 // const {data:{movies:actionList}} = await getData("https://yts.am/api/v2/list_movies.json?genre=action");
  const actionList = await cacheExist('action');

  const dramaList= await cacheExist('drama');

  const  animationList= await cacheExist('animtaion');


  renderMoviesList(actionList, $actionContainer, 'action');
  const $dramaContainer = document.querySelector('#drama');
  renderMoviesList(dramaList, $dramaContainer, 'drama');
  const $animationContainer = document.querySelector('#animation');
   renderMoviesList(animationList, $animationContainer, 'animtaion');





  

  
  //  console.log(videoItemTemplate('src/images/covers/bitcoing.jpg', 'BitgCoing'));

})()

