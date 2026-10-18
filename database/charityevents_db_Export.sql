-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Fun Run','Outdoor running charity events'),(2,'Charity Concert','Live music fundraising shows'),(3,'Workshop','Educational and skill-sharing charity workshops'),(4,'Gala Dinner','Formal dinner and banquet fundraising events'),(5,'Community Fair','Local community market and charity stalls'),(6,'Charity Auction','Charity auctions of donated artworks, collectibles and goods'),(7,'Material Donation','Collection drives for clothing, food and essential supplies'),(8,'Community Service','Hands-on community service and neighbourhood improvement activities'),(9,'Volunteer Program','Volunteer recruitment, outreach and community volunteering programs');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charity`
--

DROP TABLE IF EXISTS `charity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charity` (
  `charity_id` int NOT NULL AUTO_INCREMENT,
  `charity_name` varchar(150) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(30) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`charity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charity`
--

LOCK TABLES `charity` WRITE;
/*!40000 ALTER TABLE `charity` DISABLE KEYS */;
INSERT INTO `charity` VALUES (1,'Sydney Community Charity','contact@sydcommunity.org','02-91234567','Local charity supporting disadvantaged families in Sydney'),(2,'Green Future Foundation','info@greenfuture.org.au','02-97654321','Environmental charity for tree planting and climate education'),(3,'Kids Hope Australia','support@kidshope.org','02-99887766','Charity helping children living in poverty'),(4,'Hope Community Foundation','contact@hopecommunity.org','0411-222-333','Dedicated to supporting homeless families and providing food assistance for low-income households in the city'),(5,'Bright Future Children Aid','info@brightfuture.org','0411-333-444','Focus on improving education and mental health support for disadvantaged children and teenagers'),(6,'Green Earth Volunteer Alliance','team@greenearth.org','0411-444-555','Committed to environmental protection, community greening and sustainable lifestyle promotion'),(7,'Senior Care Welfare Society','support@seniorcare.org','0411-555-666','Provides daily care and companionship services for elderly citizens living alone in the community');
/*!40000 ALTER TABLE `charity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `charity_id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `event_date` date NOT NULL,
  `location` varchar(255) NOT NULL,
  `purpose` text,
  `ticket_price` decimal(10,2) NOT NULL,
  `goal_amount` decimal(12,2) DEFAULT NULL,
  `current_amount` decimal(12,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `charity_id` (`charity_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `event_ibfk_1` FOREIGN KEY (`charity_id`) REFERENCES `charity` (`charity_id`) ON DELETE RESTRICT,
  CONSTRAINT `event_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_current_amount` CHECK ((`current_amount` >= 0)),
  CONSTRAINT `chk_event_status` CHECK ((`status` in (_utf8mb4'Active',_utf8mb4'Past',_utf8mb4'Suspended'))),
  CONSTRAINT `chk_goal_amount` CHECK ((`goal_amount` >= 0)),
  CONSTRAINT `chk_ticket_price` CHECK ((`ticket_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,1,1,'Sydney Charity Fun Run','5km community run to raise money for poor families','2026-11-10','Centennial Park Sydney','Fund support for low-income households',25.00,5000.00,2100.00,'Active','/images/funrun.jpg',-33.8879000,151.2306000),(2,2,2,'Green Future Charity Concert','Live band concert for environmental protection','2026-11-15','Sydney Town Hall','Raise funds for urban reforestation',45.00,8000.00,3600.00,'Active','/images/concert.jpg',-33.8731000,151.2072000),(3,3,3,'Children Mental Health Workshop','Free workshop for parents and children','2026-11-20','Parramatta Community Centre','Mental health education for kids',0.00,2000.00,800.00,'Active','/images/workshop.jpg',-33.8147000,151.0018000),(4,1,5,'Winter Community Charity Fair','Market stalls to collect winter supplies','2026-08-05','Bondi Community Hall','Collect warm clothes for homeless people',0.00,3000.00,3000.00,'Past','/images/fair.jpg',-33.8916000,151.2765000),(5,4,1,'City 5K Fun Run 2026','A 5-kilometre casual running event open to citizens of all ages, with on-site snack stations and souvenir medals.','2026-10-27','Central City Park','Raise public awareness of poverty issues; all ticket revenue will be used for community food bank supplies.',25.00,15000.00,6200.00,'Active','/images/funrun.jpg',-33.8988000,151.2344000),(6,4,4,'Annual Charity Gala Dinner','Formal banquet night with charity speeches, silent auction sessions and a live band performance.','2026-11-02','Grand City Ballroom','Raise funds for the winter heating assistance program for low-income families.',120.00,30000.00,11500.00,'Active','/images/gala.jpg',-33.8700000,151.2080000),(7,5,6,'Children Charity Art Auction','Auction of paintings and handcrafts donated by primary school students, plus artworks from local artists.','2026-10-22','City Art Centre Hall','All proceeds will be used to build reading rooms in rural primary schools and purchase children books.',0.00,8000.00,3400.00,'Active','/images/auction.jpg',-33.8688000,151.2174000),(8,5,7,'Winter Warmth Material Donation','Collect winter coats, scarves, gloves and stationery for children in mountainous areas.','2026-11-20','Bright Future Community Centre','Gather living supplies and learning materials to help children in remote areas get through the cold winter.',0.00,5000.00,4200.00,'Active','/images/fair.jpg',-33.8170000,151.0150000),(9,6,9,'River Bank Cleaning Volunteer Program','A one-day volunteer activity to clean up rubbish along the city river bank; tools and training are provided.','2026-10-08','Riverside Green Park','Improve the river ecological environment and promote public awareness of environmental protection.',0.00,4000.00,1800.00,'Past','/images/cleaning.jpg',-33.8152000,151.0060000),(10,6,8,'Community Greening Service Day','Volunteers help plant flowers and trees in old residential areas, and teach residents gardening knowledge.','2026-09-10','Old Town East Community','Improve the living environment of old communities and build a green and beautiful neighbourhood.',0.00,3500.00,3500.00,'Past','/images/cleaning.jpg',-33.8920000,151.2500000),(11,7,4,'Charity Gala for Senior Citizens','A gala with classic song performances and afternoon tea, specially prepared for local elderly residents.','2026-12-18','Harbour View Hotel Function Room','Enrich the spiritual life of empty-nest elderly and raise funds for the community senior care service.',15.00,12000.00,7800.00,'Active','/images/gala.jpg',-33.8747000,151.2019000),(12,7,8,'Home Companion Volunteer Service','Volunteers visit homebound elderly regularly, help with housework and provide emotional companionship.','2026-11-18','South Street Community','Relieve the loneliness of elderly people living alone and help them solve daily life inconveniences.',0.00,9500.00,1300.00,'Suspended','/images/volunteer.jpg',-33.8900000,151.2100000);
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration`
--

DROP TABLE IF EXISTS `registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration` (
  `registration_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `tickets` int NOT NULL,
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `uk_event_email` (`event_id`,`email`),
  CONSTRAINT `registration_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_tickets` CHECK ((`tickets` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration`
--

LOCK TABLES `registration` WRITE;
/*!40000 ALTER TABLE `registration` DISABLE KEYS */;
INSERT INTO `registration` VALUES (1,1,'Alice Smith','alice@example.com','0412000001',2,'2026-10-18 09:10:00'),(2,1,'Bob Johnson','bob@example.com','0412000002',1,'2026-10-18 09:15:00'),(3,1,'Charlie Lee','charlie@example.com','0412000003',3,'2026-10-18 10:22:00'),(4,2,'Diana Wang','diana@example.com','0412000004',2,'2026-10-18 13:41:00'),(5,2,'Ethan Brown','ethan@example.com','0412000005',1,'2026-10-18 14:00:00'),(6,2,'Fiona Clark','fiona@example.com','0412000006',4,'2026-10-18 15:30:00'),(7,3,'George Hall','george@example.com','0412000007',2,'2026-10-18 16:10:00'),(8,3,'Hannah Miller','hannah@example.com','0412000008',1,'2026-10-18 16:45:00'),(9,4,'Ivy Wilson','ivy@example.com','0412000009',5,'2026-10-18 17:20:00'),(10,4,'Jack Taylor','jack@example.com','0412000010',2,'2026-10-18 17:55:00'),(11,5,'Kevin Adams','kevin@example.com','0413000011',2,'2026-10-14 09:00:00'),(12,5,'Lily Nguyen','lily@example.com','0413000012',1,'2026-10-15 11:30:00'),(13,5,'Mike Zhang','mike@example.com','0413000013',3,'2026-10-16 14:20:00'),(14,6,'Nancy Brown','nancy@example.com','0413000014',2,'2026-10-13 10:00:00'),(15,6,'Oscar Lee','oscar@example.com','0413000015',2,'2026-10-14 16:00:00'),(16,6,'Paula King','paula@example.com','0413000016',4,'2026-10-15 09:45:00'),(17,6,'Quinn Wright','quinn@example.com','0413000017',1,'2026-10-17 13:10:00'),(18,7,'Rachel Green','rachel@example.com','0413000018',2,'2026-10-12 10:30:00'),(19,7,'Sam Wilson','sam@example.com','0413000019',1,'2026-10-16 15:00:00'),(20,8,'Tina Liu','tina@example.com','0413000020',1,'2026-10-15 10:00:00'),(21,8,'Uma Patel','uma@example.com','0413000021',2,'2026-10-17 11:20:00'),(22,9,'Victor Chen','victor@example.com','0413000022',1,'2026-10-02 09:00:00'),(23,9,'Wendy Scott','wendy@example.com','0413000023',2,'2026-10-03 14:00:00'),(24,9,'Xavier Moore','xavier@example.com','0413000024',1,'2026-10-05 10:40:00'),(25,10,'Yuki Tanaka','yuki@example.com','0413000025',2,'2026-09-04 09:30:00'),(26,10,'Zoe Harris','zoe@example.com','0413000026',1,'2026-09-06 13:15:00'),(27,11,'Aaron Clarke','aaron@example.com','0413000027',2,'2026-10-14 10:00:00'),(28,11,'Bella Martin','bella@example.com','0413000028',1,'2026-10-16 15:30:00'),(29,12,'Carl Davies','carl@example.com','0413000029',1,'2026-10-15 12:00:00');
/*!40000 ALTER TABLE `registration` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 22:19:57
