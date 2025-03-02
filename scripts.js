document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const statusBanner = document.getElementById('statusBanner');
    const statusMessage = document.getElementById('statusMessage');
    const closeBanner = document.getElementById('closeBanner');
    const submitButton = document.querySelector('#contactForm button[type="submit"]');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressCircle = document.getElementById('progressCircle');
    const progressText = document.getElementById('progressText');

    // Function to validate phone number (E.164 format: +[country code][number])
    function validatePhoneNumber(phone) {
        const phoneRegex = /^\+[1-9]\d{1,14}$/; // Matches E.164 format (e.g., +94771234567)
        return phoneRegex.test(phone);
    }

    // Handle form submission
    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Disable the submit button to prevent duplicate submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Validate phone number
        const phoneInput = document.getElementById('phone').value.trim();
        if (!validatePhoneNumber(phoneInput)) {
            alert('Please enter a valid phone number with a country code (e.g., +94 77 123 4567).');
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            return;
        }

        // Show progress indicator only if files are attached
        const files = Array.from(document.getElementById('attachments').files);
        if (files.length > 0) {
            uploadProgress.style.display = 'block';
        }

        // Simulate form submission (replace this with your actual API call)
        try {
            const formData = new FormData(contactForm);

            // Simulate a delay for uploading files
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Simulate server response
            const serverResponse = { success: true, message: 'Your message has been sent successfully!' };

            if (serverResponse.success) {
                // Hide the progress indicator
                uploadProgress.style.display = 'none';

                // Show success banner
                statusMessage.textContent = serverResponse.message;
                statusBanner.classList.remove('error');
                statusBanner.style.display = 'block';

                // Reset the form
                contactForm.reset();
            } else {
                throw new Error(serverResponse.message || 'Failed to send message.');
            }
        } catch (error) {
            // Hide the progress indicator
            uploadProgress.style.display = 'none';

            // Show error banner
            statusMessage.textContent = error.message || 'An unexpected error occurred. Please try again later.';
            statusBanner.classList.add('error');
            statusBanner.style.display = 'block';
        } finally {
            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });

    // Close the status banner
    closeBanner.addEventListener('click', function () {
        statusBanner.style.display = 'none';
    });

    // Ensure the close banner is focusable and accessible
    closeBanner.tabIndex = 0;
    closeBanner.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            closeBanner.click();
        }
    });
});