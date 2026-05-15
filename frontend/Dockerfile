# ─────────────────────────────────────────────
#  Frontend Dockerfile
#  Uses Nginx to serve our static HTML/CSS/JS
# ─────────────────────────────────────────────

# Use the official lightweight Nginx image
FROM nginx:alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy our HTML file into the folder Nginx serves
COPY index.html /usr/share/nginx/html/

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 is where Nginx listens
EXPOSE 80
