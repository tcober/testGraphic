import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GraphicComponent } from "./components/graphic/graphic.component";

const routes: Routes = [
  {
    path: "",
    component: GraphicComponent,
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
