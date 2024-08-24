# Use the official Nginx image as a base
FROM nginx:alpine

# Install OpenSSL to generate the certificates
RUN apk add --no-cache openssl

# Create a directory to store the certificates
RUN mkdir /etc/nginx/ssl

# Generate a self-signed certificate and key
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx-selfsigned.key -out /etc/nginx/ssl/nginx-selfsigned.crt -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.shorten-url.com"

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 443 for SSL
EXPOSE 80
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
