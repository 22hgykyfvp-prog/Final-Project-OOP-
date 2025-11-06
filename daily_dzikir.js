// Function to load and store the checkbox state in localStorage
// dzikir.js 

function loadDzikirState() {
  const dzikirItems = document.querySelectorAll('.dzikir-item');
  
  dzikirItems.forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    const dzikirId = item.getAttribute('data-id');
    const savedState = localStorage.getItem(`dzikir_${dzikirId}`);
    
    if (savedState === 'checked') {
      checkbox.checked = true;
      item.style.backgroundColor = '#4CAF50'; // Green for completed
    } else {
      checkbox.checked = false;
      item.style.backgroundColor = '#15213b'; // Default color
    }

    // Add event listener to toggle completion state
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        item.style.backgroundColor = '#4CAF50'; // Mark as completed
        localStorage.setItem(`dzikir_${dzikirId}`, 'checked');
      } else {
        item.style.backgroundColor = '#15213b'; // Reset to default
        localStorage.setItem(`dzikir_${dzikirId}`, 'unchecked');
      }
    });
  });
}

// Run the function on page load
document.addEventListener('DOMContentLoaded', loadDzikirState);
