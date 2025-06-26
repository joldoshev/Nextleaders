document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form910744822');
    const submitButton = document.querySelector('.t-submit');

    if (form && submitButton) {
        // Add the event listener with the `capture` option set to true.
        // This makes our listener run before most other listeners.
        submitButton.addEventListener('click', function(event) {
            // Prevent the default action (like following a link if the button is an `<a>` tag)
            event.preventDefault();
            // Stop other event listeners on the same element from being executed.
            // This is crucial to prevent Tilda's scripts from overriding our submission.
            event.stopImmediatePropagation();

            console.log('Custom form handler triggered.');

            // Perform basic client-side validation
            const nameInput = form.querySelector('input[name="Name"]');
            const phoneInput = form.querySelector('input[name="Phone"]');

            if (!nameInput.value.trim() || !phoneInput.value.trim()) {
                alert('Please fill in all required fields: Name and Phone.');
                return; // Stop the submission if validation fails
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            console.log('Submitting form data:', JSON.stringify(data));

            fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                console.log('Received response from server:', response);
                if (response.redirected) {
                    window.location.href = response.url; // Success case
                    return;
                }

                // If not redirected, it's an error. Let's get the body.
                return response.json()
                    .then(result => {
                        // We have a JSON error body.
                        console.error('Form submission failed with JSON response:', result);
                        let errorMessage = result.message || 'Unknown error';
                        if (result.received_body) {
                            errorMessage += '\n\nDEBUG INFO:\nReceived by server: ' + JSON.stringify(result.received_body);
                        }
                        alert('Form submission failed: ' + errorMessage);
                    })
                    .catch(() => {
                        // The error body wasn't JSON. Show a generic error with status.
                        console.error('Server responded with an error and non-JSON body:', response.status, response.statusText);
                        alert(`Server error: ${response.status} ${response.statusText}. Please try again later.`);
                    });
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('An error occurred while submitting the form. Please try again.');
            });
        }, true); // The `true` here sets the `capture` option.
    } else {
        console.error('Form or submit button not found.');
    }
});
