angular.module('regidiumApp')
    .controller('DepartmentsCtrl', function ($scope, Departments, operators) {


        $scope.currentUser = {};

        $scope.operators = operators.operators;

        operators.getOperator().then(function(currentUser){
          $scope.currentUser = currentUser;
            $scope.departments = Departments.query();
        });

        $scope.modalform = {
            name: ''
        };

        $scope.getMembers = function(id){
            return operators.getDepartmentMembers(id);
        };


        $scope.modalFormMode = 'create';
        $scope.errors = {};

        $scope.add = function(){
            $('#addDepartmentModal').appendTo('body').modal('show');
            $scope.modalform = {
                name: ''
            };
            $scope.modalFormMode = 'create';
        };

        $scope.edit = function(id){
            $('#addDepartmentModal').appendTo('body').modal('show');

            var dp = _.find($scope.departments, {_id:id});

            $scope.modalform = {
                name: dp.name,
                _id: dp._id
            };

            $scope.modalFormMode = 'update';
        };

        $scope.delete = function(id){
            Departments.remove({id: id },
                function(data) {
                    _.remove($scope.departments, {_id:id});
                },

                function(err) {

                });
        };

        $scope.submitForm = function(form){
            $scope.submitted = true;

            if(form.$valid) {

                if($scope.modalFormMode == 'create') {
                    //create
                    Departments.save($scope.modalform,
                        function(data) {
                            $scope.departments.push(data);
                        },
                        function(err) {
                            console.log(err);
                        });
                    $('#addDepartmentModal').modal('hide').remove('.modal-backdrop');
                } else {
                    //update

                    Departments.update({id: $scope.modalform._id}, $scope.modalform,
                        function() {
                            var dp = _.find($scope.departments, {_id:$scope.modalform._id});
                            dp.name = $scope.modalform.name;
                        },
                        function(err) {
                            console.log(err);

                        });
                    $('#addDepartmentModal').modal('hide').remove('.modal-backdrop');
                }

            } else {
                //invalid form

            }
        };
        
        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip()

        }, 0);

    });
