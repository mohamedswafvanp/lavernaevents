from django.urls import path

from .views import (
    ChangePlanView,
    MembershipPlanDetailView,
    MembershipPlanListView,
    MySubscriptionView,
    MyUsageView,
    SubscribeView,
)


urlpatterns = [
    path("plans/", MembershipPlanListView.as_view(), name="plan-list"),
    path("plans/<slug:slug>/", MembershipPlanDetailView.as_view(), name="plan-detail"),
    path("subscribe/", SubscribeView.as_view(), name="subscribe"),
    path("change-plan/", ChangePlanView.as_view(), name="change-plan"),
    path("my-subscription/", MySubscriptionView.as_view(), name="my-subscription"),
    path("my-usage/", MyUsageView.as_view(), name="my-usage"),
]
