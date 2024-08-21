<h1>Custom IP Address to Country Mapping Functionality</h1>

<h3>Background and Requirements</h3>

In building a URL shortening service, tracking the geographic location of users is critical for analyzing traffic sources and user behavior. To achieve this, we implemented a custom module that maps IP addresses to specific countries or regions.  

---

### Considerations
##### Data Accuracy and Timeliness:

- By using a daily-updated data source, we ensure the accuracy of geographic information. The automated update mechanism reduces the need for manual maintenance.  

##### System Stability:

- The use of database renaming and backup strategies ensures that the system remains operational during updates, achieving a zero-downtime update process.  

##### Performance Optimization:

- By storing IP addresses as numerical ranges, the system can perform efficient range queries, ensuring fast response times even under high concurrency.  

---

### Details

<h6> Data Source: </h6> 

- We selected the [SAPICS IP Location Database](https://github.com/sapics/ip-location-db) as our data source. This is a free database that provides mappings of IP addresses to countries and is updated daily, ensuring data accuracy.  

<h6>Scheduled Updates and Database Switching:</h6>  

- Using NestJS's @Cron scheduling feature, a task is run daily to automatically download the latest CSV file from the data source, ensuring our database remains up-to-date.  
  
- Once the new data is downloaded, it is parsed and stored in a temporary database (GeoIpTemp). The MongoDB renaming functionality is then used to switch the temporary database to the live environment, ensuring `zero downtime` during updates. The previous day's database is backed up for safety.  

<h6> Data Storage:</h6> 

- To enhance query efficiency, IP addresses are stored as numerical ranges, allowing for range queries to quickly identify the country associated with a specific IP address.  

---

#### Conclusion  
  
The custom IP address mapping functionality is carefully designed to balance data accuracy, system stability, and performance efficiency. This functionality forms a reliable foundation for the entire URL shortening service's data analysis capabilities and ensures that the system remains stable and responsive, even under heavy load.  
