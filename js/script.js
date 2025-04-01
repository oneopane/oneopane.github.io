import config from './config.js';

// Update page content with config
document.addEventListener('DOMContentLoaded', () => {
    // Update title
    document.title = config.site.title;
    
    // Update name and title
    document.querySelector('h1').textContent = config.name;
    
    // Update social links
    const socialLinks = document.querySelector('.social-links');
    socialLinks.innerHTML = `
        <a href="${config.social.github}" target="_blank"><i class="fab fa-github"></i></a>
        <a href="${config.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
        <a href="${config.social.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
        <a href="${config.social.googleScholar}" target="_blank"><i class="fas fa-graduation-cap"></i></a>
    `;
    
    // Update about content
    const aboutContent = document.querySelector('.about-content');
    aboutContent.innerHTML = `
        ${config.about.description.map(p => `<p>${p}</p>`).join('')}
    `;
    
    // Update featured publications
    const publicationsList = document.querySelector('.publications-list');
    publicationsList.dataset.featuredPubs = config.featuredPublications.join(', ');

    // Initialize other functionality
    setTimeout(loadPublications, 100);
    initializeFadeIn();
});

// Initialize fade-in animation
function initializeFadeIn() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Simple fade-in animation for sections
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// BibTeX data embedded directly
const bibData = `@article{neopane2024example,
  title={Example Paper Title for Machine Learning Research},
  author={Neopane, Ojash and Coauthor, Alice and Coauthor, Bob},
  journal={Journal of Machine Learning Research},
  volume={15},
  pages={1--25},
  year={2024},
  publisher={JMLR},
  url={https://example.com/paper1},
  code={https://github.com/example/code1},
  project={https://example.com/project1}
}

@inproceedings{neopane2023neural,
  title={Neural Network Approaches to Complex Problems},
  author={Neopane, Ojash and Coauthor, Charlie and Coauthor, Diana},
  booktitle={Proceedings of the International Conference on Machine Learning},
  pages={2000--2008},
  year={2023},
  organization={ICML},
  url={https://example.com/paper2},
  code={https://github.com/example/code2}
}

@article{neopane2022deep,
  title={Deep Learning for Computer Vision: A Comprehensive Survey},
  author={Neopane, Ojash and Coauthor, Eve},
  journal={IEEE Transactions on Pattern Analysis and Machine Intelligence},
  volume={44},
  number={3},
  pages={3001--3020},
  year={2022},
  publisher={IEEE},
  url={https://example.com/paper3}
}

@inproceedings{neopane2021transformer,
  title={Transformer Architectures for Multi-Modal Learning},
  author={Neopane, Ojash and Researcher, Frank and Expert, Grace},
  booktitle={Advances in Neural Information Processing Systems},
  pages={1234--1245},
  year={2021},
  organization={NeurIPS},
  url={https://example.com/paper4},
  code={https://github.com/example/code4}
}

@article{neopane2021federated,
  title={Federated Learning: Privacy-Preserving Distributed Training},
  author={Neopane, Ojash and Scholar, Henry},
  journal={IEEE Transactions on Machine Learning},
  volume={12},
  number={4},
  pages={445--460},
  year={2021},
  publisher={IEEE},
  url={https://example.com/paper5},
  code={https://github.com/example/code5},
  project={https://example.com/project5}
}`;

// Publication Loader
async function loadPublications() {
    const publicationsList = document.querySelector('.publications-list');
    const workshopPublicationsList = document.querySelector('.workshop-publications-list');
    const loadingIndicator = document.querySelector('.loading-publications');
    const showAllBtn = document.getElementById('showAllBtn');
    const workshopSection = document.getElementById('workshop-publications');
    const featuredPubs = publicationsList.dataset.featuredPubs.split(',').map(pub => pub.trim());
    let allPublications = [];
    let workshopPublications = [];
    let mainPublications = [];
    let isShowingAll = false;

    try {
        // Fetch the actual ref.bib file
        const response = await fetch('files/ref.bib');
        const bibText = await response.text();
        const entries = parseBibTeX(bibText);
        allPublications = entries;

        // Sort publications by arxivdate (newest first)
        allPublications.sort((a, b) => {
            const dateA = a.arxivdate ? a.arxivdate.split('-').join('') : '000000';
            const dateB = b.arxivdate ? b.arxivdate.split('-').join('') : '000000';
            return dateB.localeCompare(dateA);
        });

        // Separate workshop papers from main publications
        workshopPublications = allPublications.filter(pub => pub.category === 'workshop');
        mainPublications = allPublications.filter(pub => pub.category !== 'workshop');

        // Filter featured publications
        const featuredPublications = mainPublications.filter(pub => 
            featuredPubs.includes(pub.key)
        );

        // Sort featured publications to match the order in data-featured-pubs
        const sortedFeaturedPubs = featuredPubs
            .map(key => featuredPublications.find(pub => pub.key === key))
            .filter(pub => pub !== undefined);

        function displayPublications(publications, container) {
            container.innerHTML = '';
            publications.forEach(entry => {
                const publication = createPublicationElement(entry);
                container.appendChild(publication);
            });
        }

        // Initial display of featured publications
        displayPublications(sortedFeaturedPubs, publicationsList);
        
        // Initially hide the workshop section
        workshopSection.style.display = 'none';

        // Show all button functionality
        showAllBtn.addEventListener('click', () => {
            isShowingAll = !isShowingAll;
            showAllBtn.textContent = isShowingAll ? 'Show Selected' : 'Show All';
            document.getElementById('publications-title').textContent = isShowingAll ? 'All Publications' : 'Selected Publications';
            
            // Display main publications
            displayPublications(isShowingAll ? mainPublications : sortedFeaturedPubs, publicationsList);
            
            // Show/hide workshop section based on whether we're showing all
            if (isShowingAll && workshopPublications.length > 0) {
                workshopSection.style.display = 'block';
                displayPublications(workshopPublications, workshopPublicationsList);
            } else {
                workshopSection.style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Error loading publications:', error);
        loadingIndicator.innerHTML = '<p>Error loading publications. Please try again later.</p>';
    }
}

function parseBibTeX(bibText) {
    const publications = [];
    const entries = bibText.split('@');
    
    // Skip the first empty entry
    for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        
        // Extract entry type and key
        const typeMatch = entry.match(/^(\w+)\s*{\s*([^,]+),/);
        if (!typeMatch) continue;
        
        const [, type, key] = typeMatch;
        const pub = { type, key };
        
        // Extract fields
        const fieldRegex = /(\w+)\s*=\s*{([^{}]*(({[^{}]*})[^{}]*)*)}/g;
        let match;
        
        while ((match = fieldRegex.exec(entry)) !== null) {
            const [, field, value] = match;
            pub[field.toLowerCase()] = value.trim();
        }
        
        publications.push(pub);
    }
    
    return publications;
}

function renderPublications(publications) {
    const container = document.querySelector('#publications .publications-list');
    if (!container) {
        console.error('Publications container not found');
        return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    if (publications.length === 0) {
        container.innerHTML = '<p>No publications found.</p>';
        return;
    }

    // Create a wrapper div for publications
    const publicationsWrapper = document.createElement('div');
    publicationsWrapper.className = 'publications-wrapper';
    
    // Show only first 3 publications initially
    const initialPublications = publications.slice(0, 3);
    initialPublications.forEach(pub => {
        const pubElement = createPublicationElement(pub);
        publicationsWrapper.appendChild(pubElement);
    });
    
    container.appendChild(publicationsWrapper);

    // Add show all button if there are more than 3 publications
    if (publications.length > 3) {
        const showAllButton = document.createElement('button');
        showAllButton.className = 'btn btn-outline show-all-btn';
        showAllButton.textContent = 'Show All Publications';
        showAllButton.onclick = () => {
            // Clear and show all publications
            publicationsWrapper.innerHTML = '';
            publications.forEach(pub => {
                const pubElement = createPublicationElement(pub);
                publicationsWrapper.appendChild(pubElement);
            });
            showAllButton.style.display = 'none';
        };
        container.appendChild(showAllButton);
    }
    
    console.log('Publications rendered successfully');
}

function createPublicationElement(pub) {
    const pubElement = document.createElement('div');
    pubElement.className = 'publication';
    
    // Format authors (last name, first initial)
    const authors = formatAuthors(pub.author);
    
    // Create publication HTML
    pubElement.innerHTML = `
        <h3>${pub.title}</h3>
        <div class="publication-info">
            <span class="authors">${authors}</span>
            <span class="venue">${formatVenue(pub)}</span>
            ${pub.note ? `<span class="note">${pub.note}</span>` : ''}
            <div class="publication-links">
                ${pub.url ? `<a href="${pub.url}" target="_blank">Paper</a>` : ''}
                ${pub.code ? `<a href="${pub.code}" target="_blank">Code</a>` : ''}
                ${pub.project ? `<a href="${pub.project}" target="_blank">Project Page</a>` : ''}
            </div>
        </div>
    `;
    
    return pubElement;
}

function formatAuthors(authorString) {
    if (!authorString) return '';
    
    return authorString.split(' and ')
        .map(author => {
            const parts = author.trim().split(', ');
            if (parts.length === 2) {
                // Already in "Last, First" format
                const firstName = parts[1].trim();
                const firstInitial = firstName.charAt(0);
                return `${parts[0]}, ${firstInitial}`;
            } else {
                // In "First Last" format
                const nameParts = author.trim().split(' ');
                const lastName = nameParts[nameParts.length - 1];
                const firstInitial = nameParts[0].charAt(0);
                return `${lastName}, ${firstInitial}`;
            }
        })
        .join(', ');
}

function formatVenue(pub) {
    let venue = '';
    if (pub.type === 'article') {
        venue = `${pub.journal}`;
    } else if (pub.type === 'inproceedings') {
        venue = `${pub.booktitle}`;
    }
    
    // Add month and year
    const month = pub.month || '';
    const year = pub.year || '';
    const dateStr = [month, year].filter(Boolean).join(' ');
    
    return `${venue}${venue ? ', ' : ''}${dateStr}`;
}

function initializeSite() {
    // Set profile image
    const profileImage = document.getElementById('profile-image');
    profileImage.src = config.profileImage;
    profileImage.alt = config.name;
}
