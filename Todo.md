Структура user-story:
Как <роль>
я хочу <действие>
чтобы <ценность>

## Задачи

### Epic: Сalendar page

### User Story: Как пользователь, я хочу создавать ивент на календаре, чтобы лучше управлять своим временем

### Acceptance Criteria
- пользователь может создать ивент
- пользователь может удалить ивент
- пользователь может создать ивент с датой начала и датой конца
- пользователь может создать несколько ивентов

---

### Tasks 

### Backend
---------------------------------
#### [x] - создать таблицу events
  - id
  - title
  - description
  - start
  - end
  - allDay
  - userId
  - updatedAt
  - createdAt
  - ...(пока не знаю какие еще есть поля в библиотечном календаре)
#### [x] - endpoint POST /user by body userId
#### [x] - endpoint GET /user?userId
#### [x] - endpoint PATCH /user by body id
#### [x] - endpoint DELETE /user by body id
#### [x] - endpoint POST /event by body userId
#### [x] - endpoint GET /event?userId
#### [x] - endpoint PATCH /event by body id
#### [x] - endpoint DELETE /event by body id
#### [x] - обработка ошибок
  #### [x] - prisma exception filter
  #### [x] - валидация HttpExceptionFilter
  #### [x] - типизация без any
  #### [x] - обработка поиска несуществующего пользователя
  #### [x] - обработка ошибок events
  #### [x] - уменьшить валидатион пайп
### Frontend
-----------------------------
#### [x] - добавить календарь
  #### [] - адаптировать стиль ui/code под проект
#### [] - создать страницу /calendar
#### [] - синхронизировать events на клиенте и сервере
#### [] - обработка ошибок API
#### [] - хранение, изменения и прочее делается в zustand
#### [] - кэширование и запросы tanstack
