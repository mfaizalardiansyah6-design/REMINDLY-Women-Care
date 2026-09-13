---
paths:
  - 'resources/js/pages/{Reminders,Tasks,Notes,Locations}.jsx'
---

# Pages

## Category & location wiring pattern
Categories are type-scoped (reminder/note/task). Forms/dropdowns load them via categoryApi.index('reminder'|'task'|'note'); list filters pass category_id; items show a category chip using the nested 'category' object. Locations is CRUD with a near?lat&lng filter that uses Location::isInRadius() on the server.
