// Move all HTML code to an .html file and keep only JavaScript code here.
// For example, save the HTML part in 'index.html' and the script below in 'main.js'.

// Example: Only JavaScript code should be in this file

function Home() {
  window.location.reload();
}

// Ensure playsinline for all video elements (for iOS and cross-browser support)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('video').forEach(function(video) {
    video.setAttribute('playsinline', '');
  });
});

// Handle video upload
const commentBtn = document.querySelector('.comment-btn');
const commentsSection = document.getElementById('comments');
commentBtn.addEventListener('click', () => {
  commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
});
// Toggle comments section visibility
document.querySelectorAll('.like-comment').forEach(button => {
  button.addEventListener('click', () => {
    const currentText = button.innerText;
    let count = parseInt(currentText.match(/\d+/)[0]);
    count += 1;
    button.innerText = `❤️ ${count}`;
  });
});
document.querySelectorAll('.retweet-comment').forEach(button => {
  button.addEventListener('click', () => {
    alert('Comment retweeted!');
  });
});
// Upload video
document.getElementById('upload-btn').addEventListener('click', () => {
  document.getElementById('video-upload').click();
});

document.getElementById('video-upload').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    alert('Video selected: ' + file.name);
    // Upload logic here
  }
});

// Redirect to login
document.getElementById('login-btn').addEventListener('click', () => {
  window.location.href = 'signup.html';
});

// Like button toggle
document.addEventListener('click', function (e) {
  const button = e.target.closest('.like-btn');
  if (button) {
    const countSpan = button.querySelector('.count');
    let count = parseInt(countSpan.textContent.replace(/,/g, '')) || 0;

    if (button.classList.toggle('liked')) {
      count += 1;
    } else {
      count -= 1;
    }

    countSpan.textContent = count.toLocaleString();
  }
});

// Auto-play/pause based on scroll visibility
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play();
    } else {
      video.pause();
    }
  });
}, { threshold: 0.7 });

document.querySelectorAll('.video-card video').forEach(video => observer.observe(video));
// Comments functionality
// Post a comment
document.getElementById('post-comment').addEventListener('click', () => {
  const text = document.getElementById('comment-text').value.trim();
  if (!text) return;

  const commentEl = document.createElement('div');
  commentEl.classList.add('comment');
  commentEl.innerHTML = `
    <span class="comment-user">@you</span>
    <span class="comment-text">${text}</span>
    <div class="comment-actions">
      <button class="comment-like-btn"><i class="fas fa-heart"></i> <span class="count">0</span></button>
      <button class="comment-retweet-btn"><i class="fas fa-retweet"></i> <span class="count">0</span></button>
    </div>
  `;

  document.getElementById('comments-list').appendChild(commentEl);
  document.getElementById('comment-text').value = '';
});

// Like or retweet a comment
document.addEventListener('click', function (e) {
  // Comment like
  if (e.target.closest('.comment-like-btn')) {
    const btn = e.target.closest('.comment-like-btn');
    const countSpan = btn.querySelector('.count');
    let count = parseInt(countSpan.textContent) || 0;
    if (btn.classList.toggle('liked')) count++; else count--;
    countSpan.textContent = count;
  }

  // Comment retweet
  if (e.target.closest('.comment-retweet-btn')) {
    const btn = e.target.closest('.comment-retweet-btn');
    const countSpan = btn.querySelector('.count');
    let count = parseInt(countSpan.textContent) || 0;
    if (btn.classList.toggle('retweeted')) count++; else count--;
    countSpan.textContent = count;
  }
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) loginBtn.style.display = 'none';
      const uploadBtn = document.getElementById('upload-btn');
      if (uploadBtn) uploadBtn.style.display = 'block';
    }
  });
});
// Remove duplicate and invalid uploadVideo function definition
let lastVisible = null;
let loading = false;
async function loadVideos() {
  if (loading) return;
  loading = true;
  let query = db.collection('videos').orderBy('timestamp', 'desc').limit(5);
  if (lastVisible) query = query.startAfter(lastVisible);
  const snapshot = await query.get();
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  snapshot.forEach((doc) => {
    const video = doc.data();
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.innerHTML = `
      <video autoplay muted loop controls>
        <source src="${video.url}" type="video/mp4">
      </video>
      <div class="video-info">
        <div class="user-info">
          <img src="https://via.placeholder.com/40" class="user-avatar" alt="User">
          <span>@username</span>
        </div>
        <p class="caption">${video.description}</p>
        <div class="video-actions">
          <button class="like-btn"><i class="fas fa-heart"></i> <span class="count">${video.likes || 0}</span></button>
          <button class="comment-btn"><i class="fas fa-comment"></i> ${video.comments || 0}</button>
        </div>
      </div>
    `;
    videoFeed.appendChild(videoCard);
    observer.observe(videoCard.querySelector('video'));
    const likeBtn = videoCard.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => {
      const countSpan = likeBtn.querySelector('.count');
      let count = parseInt(countSpan.textContent.replace(/,/g, '')) || 0;
      if (likeBtn.classList.toggle('liked')) {
        count += 1;
      } else {
        count -= 1;
      }
      countSpan.textContent = count.toLocaleString();
    });
  });
  loading = false;
}
//infinite scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadVideos();
  }
});
loadVideos();