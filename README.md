# API-Project
API Projekt mit AWS, OpenAI und LindyAI Integrierung (geschrieben mit JavaScript, HTML, CSS, Python)

#### Ich wollte ein Projekt erstellen, bei dem ich verschiedenstes Erlerntes zusammen in einem Projekt kombiniere (Fokus: APIs, KI, AWS-Cloud)


## Mein Plan:
##### Über ein UI kann ein Bewerbungstext eines Schausspielers abgeschickt werden. Der Text wird dann auf bestimmte Informationen, über den Kandidaten, von KI gefiltert. Die Informationen werden dann in eine AWS DB gesendet und dort gespeichert. Außerdem wollte ich eine E-Mail Automatisiserung mit einbeziehen. Daher wird, wenn bestimmte Kriterien des Schauspielers erfüllt werden, automatisch eine E-Mail, mit den Informationen dieses Schauspielers, gesendet. Außerdem können über eine E-Mail, mittels einfacher Sprache, Kriterien genannt werden, nachdenen Schauspieler aus der DB gesucht werden sollen. Dieser Kriterientext wird dann von KI ausgewertet, die DB abgerufen und nach passenden Kandidaten gesucht. Erfolgreiche Kandidaten werden dann per E-Mail gesendet. 


## Mein Ablauf 
1. UI mit Textformular (HTML, CSS, JS)
2. Bewerbungstext von KI auswerten lassen (OpenAI API)
3. Auswertung als JSON an AWS DynamoDB senden (API Call senden in JS; AWS --> DynamoDB, Lambda (Function mit Python), API Gateway)
4. Wenn bestimmter Filter zutrift, dann E-Mail senden (simpler Filter in JS Code; Webhook mit Lindy AI)
5. E-Mail Kriterienabfrage (Lindy AI Workflow, mit Webhook, GMail, HTTP Fetch, Lindy AI LLM/ GPT-4o-mini)
6. Proxy-Server erstellen, um API Informationen im Backend zu "verdecken"


## Step-by-Step - Schwierigkeiten und Lösungen
- Das UI habe ich schnell in Canva entworfen, dann mit ChatGPT schreiben lassen und manuell nurnoch leit angepasst.
- Die API-Verbindung mit OpenAI lief sehr gut. Mittels einer spezifischen Prompt der System-Rolle habe ich dafür gesorgt, dass der Output nur aus bestimmten Informationen und JSON Format besteht, damit ich den Output direkt per API GET Request weiter senden kann. Beim Entwerfen des ganzen JavaScript-Codes habe ich eng mit ChatGPT zusammen gearbeitet und mir vieles Entwerfen lassen.
- In AWS habe ich zunächst eine neue Tabelle in der DynamoDB erstellt. Dann kreierte ich eine neue Lambda Function. Dafür musste ich zunächste eine neue IAM-Rolle, mit all den Rechten, erstellen. Dann setzte ich mit dem API Gateway eine Rest API, mit verschiedenen Pfaden (/status : Abfragen des Status, vorallem aus Test Zwecken; /actor : Einzelne Schauspieler hinzufügen/ löschen ; /all : Alle Schauspieler Aufrufen) und Requests auf. Für die Lambda Function hatte ich bereits in der Vergangenheit einen Default Python-Code, bei dem ich nur noch die einzelnen Werte anpassen musste. Die Verbindung habe ich dann über Postman getestet.
- Für die E-Mail Automatisierungen habe ich Lindy AI gewählt. Ich hatte das Tool gerade neu kennen gelernt und ich fand es ganz cool, deshalb wollte ich es gerne nutzen.
- Der Relevanz eines Proxy-Servers bin ich mir erst im Nachhinein bewusst geworden. Daher habe ich diesen auch erst im Nachinein erstellt. Zuvor wurden alle API Calls in script.js gemacht. Da ich zuvor noch keinerlei Erfahrung mit einem Proxy-Server hatte, musste ich mich zunächst in die gesamte Thematik einarbeiten. Dafür musste ich zunächst erstmal ein kleines Test-Projekt erstellen. Als ich das ganze System dann jedoch verstanden habe war die Sache nach einem kurzen Debug erledicht.

- Beim Teil mit dem Code und der API Verbindung mit AWS musste ich oft debuggen (viel ChatGPT verwendet), der Teil mit Lindy AI ging sehr unbeschwert.
- Ich habe alle Schritte immer in Unterschritten geplant. Dafür nutzte ich Notion. Für Recherche und Problemlösung habe ich ChatGPT und teilweise YT und Google verwendet.

  ## Hinweis
  - Zu den Code Files kommen in meinem Code natürlich noch die node_moudles für den Proxy-Server hinzu.
  - Der Python Code dient nur zur Veranschaulichung. Er wird nicht im Code benötigt, sondern muss in AWS, als Lambda Function eingebettet werden.
