const forumLatest = "https://cdn.freecodecamp.org/curriculum/forum-latest/latest.json";   //API to be fetched
const forumTopicUrl = "https://forum.freecodecamp.org/t/";      //constructing link
const forumCategoryUrl = "https://forum.freecodecamp.org/c/";   //constructing link
const avatarUrl = "https://sea1.discourse-cdn.com/freecodecamp";  //constructing link

const postsContainer = document.getElementById("posts-container");

//This object maps category IDs to their corresponding names and CSS class names. It's used to categorize and style forum posts.
const allCategories = {
  299: { category: "Career Advice", className: "career" },
  409: { category: "Project Feedback", className: "feedback" },
  417: { category: "freeCodeCamp Support", className: "support" },
  421: { category: "JavaScript", className: "javascript" },
  423: { category: "HTML - CSS", className: "html-css" },
  424: { category: "Python", className: "python" },
  432: { category: "You Can Do This!", className: "motivation" },
  560: { category: "Backend Development", className: "backend" },
};


//This function takes a category ID and returns an HTML string for the category link.
//If the category ID is not found in allCategories, it defaults to "General".
const forumCategory = (id) => {
  let selectedCategory = {};

  if (allCategories.hasOwnProperty(id)) {
    const { className, category } = allCategories[id];

    selectedCategory.className = className;
    selectedCategory.category = category;
  } else {
    selectedCategory.className = "general";
    selectedCategory.category = "General";
    selectedCategory.id = 1;
  }
  const url = `${forumCategoryUrl}${selectedCategory.className}/${id}`;   //sample url output: https://forum.freecodecamp.org/c/career/299
  const linkText = selectedCategory.category;     //what's shown in the forum | the clickable text category
  const linkClass = `category ${selectedCategory.className}`;

  return `<a href="${url}" class="${linkClass}" target="_blank">
    ${linkText}
  </a>`;
};

//This function calculates the time difference between the current time and a given time,
//returning a human-readable string (e.g., "5m ago", "2h ago", "3d ago").
const timeAgo = (time) => {
  const currentTime = new Date();
  const lastPost = new Date(time);

  const timeDifference = currentTime - lastPost;  // Difference is in milliseconds
  const msPerMinute = 1000 * 60;          //milliseconds per minute

  const minutesAgo = Math.floor(timeDifference / msPerMinute);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }

  return `${daysAgo}d ago`;
};

//This function formats view counts, converting numbers over 1000 to a "k" format (e.g., 1500 becomes "1k").
const viewCount = (views) => {
  const thousands = Math.floor(views / 1000);

  if (views >= 1000) {
    return `${thousands}k`;
  }

  return views;
};

//This function generates HTML for user avatars based on the poster and user data.
const avatars = (posters, users) => {     //posters is an array with array as elements (data from API, from topics) | users is also an array with objects as element (from parsed data)
  return posters.map((poster) => {
      const user = users.find((user) => user.id === poster.user_id);    //goes through each object in the users array and checks if user.id === poster.user_id
      if (user) {
        const avatar = user.avatar_template.replace(/{size}/, 30);    // avatar_template: '/user_avatar/forum.freecodecamp.org/joy-okoro/{size}/359045_2.png'  => replace {size} with 30
        const userAvatarUrl = avatar.startsWith("/user_avatar/")      //avatar starts with '/user_avatar/' ? if yes,
          ? avatarUrl.concat(avatar)                                  //https://sea1.discourse-cdn.com/freecodecamp + avatar
          : avatar;
        return `<img src="${userAvatarUrl}" alt="${user.name}" />`;
      }
    })
    .join("");
};

const fetchData = async () => {
  try {
    const res = await fetch(forumLatest);
    const data = await res.json();
    showLatestPosts(data);
  } catch (err) {
    console.log(err);
  }
};

fetchData();

const showLatestPosts = (data) => {
  const { topic_list, users } = data;
  const { topics } = topic_list;  //topics is an array with objects as elements

  postsContainer.innerHTML = topics.map((item) => {
    const {
      id,           //sample: 684569
      title,        //sample: 'The freeCodeCamp Podcast is back – now with video'
      views,        //sample: 542
      posts_count,  //sample: 1
      slug,         //sample: 'the-freecodecamp-podcast-is-back-now-with-video'
      posters,      //sample: [ [Object], [Object], [Object], [Object], [Object] ] 
      category_id,  //sample: 1
      bumped_at,    //sample: '2024-04-15T16:01:26.403Z'
    } = item;

    return `
    <tr>
      <td>
        <a class="post-title" target="_blank" href="${forumTopicUrl}${slug}/${id}">${title}</a>   ${/*sample: https://forum.freecodecamp.org/t/the-freecodecamp-podcast-is-back-now-with-video/684569 */ ''}

        ${forumCategory(category_id)}
      </td>
      <td>
        <div class="avatar-container">
          ${avatars(posters, users)}
        </div>
      </td>
      <td>${posts_count - 1}</td>
      <td>${viewCount(views)}</td>
      <td>${timeAgo(bumped_at)}</td>
    </tr>`;
  }).join("");
};

