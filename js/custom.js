document.addEventListener('DOMContentLoaded', function() {
  const mobileBreakpoint = 480;

  function adjustLayout() {
    if (window.innerWidth <= mobileBreakpoint) {
      const imageElement = document.querySelector('.tn-elem__9103809161742825695287');
      const textElement = document.querySelector('.tn-elem__9103809161742825695304');
      
      // Check if elements exist and are not already wrapped
      if (imageElement && textElement && !imageElement.parentElement.classList.contains('education-first-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tn-elem education-first-wrapper'; 

        const parent = imageElement.parentElement;
        parent.insertBefore(wrapper, imageElement);
        wrapper.appendChild(imageElement);
        wrapper.appendChild(textElement);
      }
    }
  }

  function positionChameleon() {
    if (window.innerWidth <= mobileBreakpoint) {
      const chameleon = document.querySelector('.tn-elem[data-elem-id="1742825695287"]');
      const heading = document.querySelector('.tn-elem[data-elem-id="1742825695295"]');
      const container = document.querySelector('#rec910380916 .t396__artboard__content');

      if (chameleon && heading && container) {
        container.style.position = 'relative';
        chameleon.style.position = 'absolute';
        chameleon.style.width = '200px';
        chameleon.style.top = (heading.offsetTop + heading.offsetHeight - 80) + 'px';
        chameleon.style.left = '50%';
        chameleon.style.transform = 'translateX(-50%)';
        chameleon.style.zIndex = '5';
      }
    }
  }

  // Run on initial load
  adjustLayout();
  positionChameleon();
});
