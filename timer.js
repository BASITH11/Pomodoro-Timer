  
    let modes = {
      pomodoro: 25,
      short: 5,
      long: 15,
    };

    let mode = 'pomodoro';
    let timeLeft = modes[mode] * 60;
    let interval = null;

    const timeDisplay = document.getElementById('time-display');
    const startPauseBtn = document.getElementById('start-pause');
    const resetBtn = document.getElementById('reset');
    const buttons = document.querySelectorAll('.mode-switch button');
    const alarm = document.getElementById('alarm-sound');
    const waveSound = document.getElementById('wave-sound');
    const stormSound = document.getElementById('storm-sound');
    const crashSound = document.getElementById('crash-sound');
    const ship = document.getElementById('ship');
    const bigWave = document.getElementById('big-wave');
    const storm = document.getElementById('storm');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const saveSettingsBtn = document.getElementById('save-settings');
    const timeoutDisplay = document.getElementById('timeout-display');

    const alarmFlash = document.createElement('div');
    alarmFlash.className = 'alarm-flash';


    waveSound.volume = 0.3;
    stormSound.volume = 0.5;
    crashSound.volume = 1.0;
    alarm.volume = 0.6;

    function animateShip() {
      let angle = 0;
      const amplitude = 5;

      function updateShip() {
        angle += 0.01;
        const offset = Math.sin(angle) * amplitude;
        ship.style.transform = `translateX(0) rotate(${offset}deg)`;
        requestAnimationFrame(updateShip);
      }

      updateShip();
    }

    animateShip();

    function updateTimeDisplay() {
      const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const sec = String(timeLeft % 60).padStart(2, '0');
      timeDisplay.textContent = `${min}:${sec}`;
    }

    function switchMode(newMode) {
      mode = newMode;
      timeLeft = modes[mode] * 60;
      clearInterval(interval);
      interval = null;
      startPauseBtn.textContent = 'Start';
      resetWaveEffect();
      timeoutDisplay.classList.remove('active');
      stopAllSounds();

      buttons.forEach(btn => btn.classList.remove('active'));
      document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

      const color = getModeColor(mode);
      document.documentElement.style.setProperty('--pomodoro', color);
      updateTimeDisplay();
    }

    function getModeColor(mode) {
      return {
        pomodoro: '#ff4e50',
        short: '#45e994',
        long: '#4fa1ff',
      }[mode];
    }

    function startTimer() {
      if (interval) return;

      stopAllSounds();
      if (alarmFlash && alarmFlash.isConnected) {
        alarmFlash.remove();
      }
      alarmFlash.style.opacity = '0'; // Hide flash at start

      waveSound.loop = true;
      waveSound.play();

      const halfTime = Math.floor(timeLeft / 2);
      let thunderPlayed = false;
      let alarmStarted = false;

      interval = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();

        if (timeLeft === halfTime && !thunderPlayed) {
          stormSound.play();
          thunderPlayed = true;
        }

        if (timeLeft === 7 && !alarmStarted) {
          alarm.play();
          alarmStarted = true;
          document.body.appendChild(alarmFlash);
          alarmFlash.style.opacity = '0.5';  // Show flash on alarm start
        }

        if (timeLeft <= 0) {
          clearInterval(interval);
          interval = null;
          stopAllSounds();
          triggerWaveEffect();
          showTimeout();
          if (alarmFlash && alarmFlash.isConnected) {
            alarmFlash.remove();
          }
          alarmFlash.style.opacity = '0';  // Hide flash on timer end
        }
      }, 1000);
    }

    function pauseTimer() {
      clearInterval(interval);
      interval = null;
      waveSound.pause();
      if (alarmFlash && alarmFlash.isConnected) {
        alarmFlash.remove();
      }
      alarmFlash.style.opacity = '0';  // Hide flash on pause
    }

    function stopAllSounds() {
      [alarm, waveSound, stormSound, crashSound].forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
      waveSound.loop = false;
      if (alarmFlash && alarmFlash.isConnected) {
        alarmFlash.remove();
      }
      alarmFlash.style.opacity = '0';  // Hide flash when sounds stop
    }

    function showTimeout() {
      timeoutDisplay.classList.add('active');
    }

    function createDebris() {
      const shipRect = ship.getBoundingClientRect();
      const shipX = shipRect.left + shipRect.width / 2;
      const shipY = shipRect.top + shipRect.height / 2;

      for (let i = 0; i < 15; i++) {
        const debris = document.createElement('div');
        debris.className = 'debris';
        debris.style.left = `${shipX}px`;
        debris.style.top = `${shipY}px`;
        debris.style.width = `${Math.random() * 30 + 10}px`;
        debris.style.height = debris.style.width;
        debris.style.backgroundColor = `hsl(${Math.random() * 60 + 240}, 80%, 70%)`;
        document.body.appendChild(debris);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 2 + 1;

        debris.animate([
          {
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 1
          },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 50}px) rotate(${Math.random() * 360}deg)`,
            opacity: 0
          }
        ], {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });

        setTimeout(() => {
          debris.remove();
        }, duration * 1000);
      }
    }

    function triggerWaveEffect() {
      crashSound.play(); // Only crash sound here

      storm.classList.add('active');
      bigWave.classList.add('active');
      ship.classList.add('sinking');
      setTimeout(createDebris, 800);

      setTimeout(() => {
        resetWaveEffect();
      }, 5000);
    }

    function resetWaveEffect() {
      storm.classList.remove('active');
      bigWave.classList.remove('active');
      ship.classList.remove('sinking');
      ship.style.transition = 'transform 0.3s ease';
      ship.style.transform = 'translateX(0) rotate(0deg)';
      ship.style.opacity = '1';
    }

    // Settings
    settingsBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('active');
    });

    saveSettingsBtn.addEventListener('click', () => {
      modes.pomodoro = parseInt(document.getElementById('pomodoro-time').value) || 25;
      modes.short = parseInt(document.getElementById('short-time').value) || 5;
      modes.long = parseInt(document.getElementById('long-time').value) || 15;

      timeLeft = modes[mode] * 60;
      updateTimeDisplay();
      settingsPanel.classList.remove('active');
    });

    // Controls
    startPauseBtn.addEventListener('click', () => {
      if (interval) {
        pauseTimer();
        startPauseBtn.textContent = 'Start';
      } else {
        startTimer();
        startPauseBtn.textContent = 'Pause';
      }
    });

    resetBtn.addEventListener('click', () => {
      switchMode(mode);
    });

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
      });
    });

    updateTimeDisplay();
  