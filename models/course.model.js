const db = require("../utils/db");
const config = require("../config/default.json");
const TBL_COURSES = "course";
const TBL_FIELDS = "field";
const TBL_STUDENT_COURSES = "studentcourse";
const TBL_TEACHERS = "teacher";
const TBL_CATEGORIES = "category";
const TBL_FAVOURITE_COURSES = "favouritecourse";
const criteria = ["CreatedAt", "CourPoint", "CourPrice"];
const order = ["desc", "asc"];
module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSES}`);
  },
  allWithDetails()
  {
     return db.load(`select c.*, tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                                from ${TBL_COURSES} c 
                                left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID 
                                left join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                                group by c.CourID
                                order by c.CreatedAt desc`);
  },
  allByStdID(id) {
    return db.load(`select c.CourID, c.CourName, c.CourImgSm, c.TeachID, tc.TeachName, tc.TeachAvatar, sc.RatID
                    from (${TBL_STUDENT_COURSES} sc 
                    inner join ${TBL_COURSES} c on c.CourID = sc.CourID) 
                    inner join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                    where sc.StdID = ${id}
                    group by sc.CourID
                    order by sc.RatID desc`);
  },

  allByTeachID(id) {
    return db.load(`select c.*, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                                from ${TBL_COURSES} c 
                                left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID 
                                where c.TeachID = ${id}
                                group by c.CourID
                                order by c.CreatedAt desc`);
  },

  allFavByStd(id) {
    return db.load(`select c.CourID, c.CourName, c.CourImgSm, c.TeachID, tc.TeachName, tc.TeachAvatar, fc.FavID
                    from (${TBL_FAVOURITE_COURSES} fc
                    inner join ${TBL_COURSES} c on c.CourID = fc.CourID) 
                    inner join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                    where fc.StdID = ${id}
                    order by fc.FavID desc`);
  },

  pageAll(offset, opt, ord) {
    if (opt > 2) opt = 0;
    if (ord > 1) ord = 0;
    return db.load(`select c.*,tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint, COUNT(*) OVER()
                    from ${TBL_COURSES} c 
                    left join ${TBL_STUDENT_COURSES} sc  on c.CourID = sc.CourID
                    left join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                    where c.isDisable = false
                    group by c.CourID
                    order by ${criteria[opt]} ${order[ord]} 
                    limit ${config.pagination.limit} offset ${offset}`);
  },

  pageSearch(text, offset, opt, ord) {
    if (opt > 2) opt = 0;
    if (ord > 1) ord = 0;
    return db.load(`select c.*,tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, 
                    count(case when sc.Point != 0 then 1 end) as CourRates,
                    avg(case when sc.Point != 0 then sc.Point end) as CourPoint, 
                    COUNT(*) OVER()
                    from ${TBL_COURSES} c 
                    left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID
                    left join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                    left join ${TBL_FIELDS} f on f.FldID = c.FldID
                    left join ${TBL_CATEGORIES} ct on ct.CatID = f.CatID
                    where (MATCH(ct.CatName )
                    AGAINST ('${text}')
                    or MATCH(f.FldName ) 
                    AGAINST ('${text}')
                    or MATCH(tc.TeachName ) 
                    AGAINST ('${text}')
                    or MATCH (c.CourName ) 
                    AGAINST ('${text}') ) and c.isDisable = false
                    group by c.CourID
                    order by ${criteria[opt]} ${order[ord]} 
                    limit ${config.pagination.limit} offset ${offset}`);
  },

  pageByCatID(id, offset, opt, ord) {
    if (opt > 2) opt = 0;
    if (ord > 1) ord = 0;
    return db.load(`select c.*,tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint, COUNT(*) OVER()
                    from ${TBL_COURSES} c 
                    left join ${TBL_STUDENT_COURSES} sc  on c.CourID = sc.CourID
                    left join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                    left join ${TBL_FIELDS} f on c.FldID = f.FldID
                    inner join ${TBL_CATEGORIES} ct on ct.CatID = f.CatID
                    where ct.CatID = ${id} and c.isDisable = false
                    group by c.CourID
                    order by ${criteria[opt]} ${order[ord]}                    
                    limit ${config.pagination.limit} offset ${offset}`);
  },

  pageByFldID(id, offset, opt, ord) {
    if (opt > 2) opt = 0;
    if (ord > 1) ord = 0;
    return db.load(`select c.*,tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint, COUNT(*) OVER()
                    from ${TBL_COURSES} c 
                    left join ${TBL_STUDENT_COURSES} sc  on c.CourID = sc.CourID
                    left join ${TBL_TEACHERS} tc on tc.TeachID = c.TeachID
                    where c.FldID = ${id} and c.isDisable = false
                    group by c.CourID
                    order by ${criteria[opt]} ${order[ord]}                   
                    limit ${config.pagination.limit} offset ${offset}`);
  },

  async single(id) {
    const rows = await db.load(`select c.*, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                                from ${TBL_COURSES} c 
                                left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID 
                                where c.CourID =${id}`);
    if (rows.length === 0) return null;
    return rows[0];
  },

  async singleWithDetails(id) {
    const rows = await db.load(`select ct.CatName, f.FldName, c.*, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                                from ${TBL_COURSES} c 
                                left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID 
                                left join ${TBL_FIELDS} f on f.FldID = c.FldID
                                left join ${TBL_CATEGORIES} ct on ct.CatID = f.CatID
                                where c.CourID = ${id}
                                group by c.CourID`);
    if (rows.length === 0) return null;
    return rows[0];
  },

  top10NewestCourses() {
    const query = `select  f.FldID, re.*, max(re.CreatedAt)
                    from (select c.*, tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                    from ${TBL_COURSES} c 
                    left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID, ${TBL_TEACHERS} tc
                    where tc.TeachID = c.TeachID and c.isDisable = false
                    group by c.CourID)
                    as re right outer JOIN ${TBL_FIELDS} f on f.FldID = re.FldID
                    group by f.FldID
                    order by re.CreatedAt desc
                    limit 10;`;

    return db.load(query);
  },

  top10ViewestCourses() {
    const query = `select  f.FldID, re.*, max(re.Views)
                    from (select c.*, tc.TeachName, tc.TeachAvatar, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                    from ${TBL_COURSES} c left outer join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID, ${TBL_TEACHERS} tc
                    where tc.TeachID = c.TeachID and c.isDisable = false
                    group by c.CourID)
                    as re right outer join ${TBL_FIELDS} f on f.FldID = re.FldID
                    group by f.FldID
                    order by re.Views desc
                    limit 10;`;

    return db.load(query);
  },

  bestSellingCatsThisWeek() {
    const query = `select ct.CatID, ct.CatName, ct.CatImg, sum(re1.tonghv) as CatStudents
                    from
                    (select f.CatID,sum(re.sohocvien) as tonghv
                    from
                    (select sc.*, count(case when sc.DOP > DATE_SUB(NOW(), INTERVAL 1 WEEK) then 1 end ) as sohocvien
                    from ${TBL_STUDENT_COURSES} sc
                    where  sc.DOP > DATE_SUB(NOW(), INTERVAL 1 WEEK)  
                    group by sc.CourID) as re  INNER join ${TBL_COURSES} c on re.CourID = c.CourID, ${TBL_FIELDS} f
                    where c.FldID = f.FldID and c.isDisable = false
                    group by c.FldID) as re1 INNER join ${TBL_CATEGORIES} ct on re1.CatID = ct.CatID
                    group by ct.CatID
                    order by CatStudents desc
                    limit 8;`;
    return db.load(query);
  },

  top3PopularCoursesThisWeek() {
    const query = `select c.*,tc.TeachName,tc.TeachAvatar, count(sc1.CourID) as CourStudents, count(case when sc1.Point!= 0 then 1 end) as CourRates, avg(case when sc1.Point!= 0 then sc1.Point end) as CourPoint
                    from 
                    (select sc.CourID,
                    count(case when sc.DOP > DATE_SUB(NOW(), INTERVAL 1 WEEK) then 1 end) as shv,
                    avg(case when Point!= 0 then sc.Point end) as point
                    from ${TBL_STUDENT_COURSES} sc 
                    where sc.DOP > DATE_SUB(NOW(), INTERVAL 1 WEEK) 
                    group by sc.CourID
                    order by shv desc, point desc
                    ) as re, ${TBL_STUDENT_COURSES} sc1, ${TBL_COURSES} c, ${TBL_TEACHERS} tc
                    where sc1.CourID = re.CourID and c.CourID = sc1.CourID and tc.TeachID = c.TeachID and c.isDisable = false
                    group by sc1.CourID
                    limit 5`;
    return db.load(query);
  },

  async add(entity) {
    const ret = await db.add(entity, TBL_COURSES);
    return ret.insertId;
  },

  patch(entity) {
    const condition = { CourID: entity.CourID };
    delete entity.CourID;
    return db.patch(entity, condition, TBL_COURSES);
  },
};
