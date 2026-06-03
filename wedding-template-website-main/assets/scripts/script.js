document.addEventListener('DOMContentLoaded', () => {
  //Formato de la fecha año-mes-diaThora:minuto:segundo formato 24 horas
  startCountdown('2025-03-30T08:00:00');//CAMBIAR FECHA Y HORA PARA ACTUALIZARLA EN EL COUNTDOWN
  setToggleAudio();
});

function getElementById(id) {
  return document.getElementById(id);
}

function startCountdown(eventDate) {
  const daysEl = getElementById('days');
  const hoursEl = getElementById('hours');
  const minutesEl = getElementById('minutes');
  const secondsEl = getElementById('seconds');

  function updateCountdown() {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diff = eventTime - now;
    let days = '00';
    let hours = '00';
    let minutes = '00';
    let seconds = '00';

    if (diff >= 0) {
      days = Math.floor(diff / (1000 * 60 * 60 * 24))
        .toString()
        .padStart(2, '0');
      hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        .toString()
        .padStart(2, '0');
      minutes = Math.floor((diff / (1000 * 60)) % 60)
        .toString()
        .padStart(2, '0');
      seconds = Math.floor((diff / 1000) % 60)
        .toString()
        .padStart(2, '0');
    }

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function setToggleAudio() {
  const audioButton = document.getElementById('toggle-music');
  const audio = document.getElementById('bg-music');
  const imgContent = document.getElementById('toggle-music-content');

  // Intenta reproducir automáticamente (algunos navegadores bloquean esto)
  audio.play().catch(() => {
    console.warn('La reproducción automática fue bloqueada.');
  });

  audioButton.addEventListener('click', function () {
    if (audio.paused) {
      audio.play();
      imgContent.setAttribute('src', './assets/img/music-icons/pause.png');
    } else {
      audio.pause();
      imgContent.setAttribute('src', './assets/img/music-icons/music-player.png');
    }
  });
}
