'use strict';
// Список сообщений от сервера, 
// [класс сообщения, текстовая расшифровка]
const ERRORS = [
 ['undefined',''],                                                                                                        // 0
 ['undefined','сервер перегружен или данные не верные'],                                                                  // 1
 ['email',    'Электронная почта указана неверно'],                                                                       // 2
 ['password', 'Пароль указан неверно'],                                                                                   // 3
 ['undefined','Ваш доступ заблокирован. Обратитесь к главному администратору аккаунта'],                                  // 4
 ['undefined','Ваш доступ заблокирован. Обратитесь к главному администратору аккаунта. Истек срок лицензии.'],            // 5
 ['undefined','Неавторизованный токен'],                                                                                  // 6
 ['email',    'Введите корректный электронный адрес'],                                                                    // 7
 ['email',    'Пользователь с такой почтой уже зарегистрирован'],                                                         // 8
 ['site',     'Введите корректный адрес сайта'],                                                                          // 9
 ['name',     'Введите корректное имя'],                                                                                  // 10
 ['undefined','Данные введены не корректно'],                                                                             // 11
 ['undefined','Оператор не найден'],                                                                                      // 12
 ['undefined','В личный кабинет был совершен вход с другого места'],                                                      // 13
 ['undefined','Нет прав на операцию'],                                                                                    // 14
 ['undefined','Нельзя удалить самого себя'],                                                                              // 15
 
];
